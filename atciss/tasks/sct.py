from io import BytesIO
from typing import Annotated
from zipfile import Path, ZipFile

from aiohttp import ClientSession
from bs4 import BeautifulSoup
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from taskiq_dependencies import Depends

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.db import get_session
from atciss.app.views import sct_parser
from atciss.app.views.dfs_aixm import Aerodrome, Navaid
from atciss.tkq import broker


async def find_airac_zip_url(http_client: ClientSession) -> str:
    async with http_client.get("http://files.aero-nav.com/EDXX") as res:
        aeronav_html = BeautifulSoup(await res.text(), "html.parser")

    for link in aeronav_html.find_all("a"):
        url = link["href"]
        if "EDMM" in url and "AIRAC" in url and ".zip" in url:
            logger.info(f"AIRAC URL: {url}")
            return url

    msg = "No EDMM AIRAC update found"
    raise RuntimeError(msg)


async def fetch_airac_zip(http_client: ClientSession, url: str) -> ZipFile:
    async with http_client.get(url, headers={"referer": "https://files.aero-nav.com/EDXX/"}) as res:
        zipbytes = await res.read()

    return ZipFile(BytesIO(zipbytes))


def extract_sct_file(zipfile: ZipFile) -> str | None:
    for path in Path(zipfile).iterdir():
        if path.suffix == ".sct":
            logger.info(f".sct file: {path.name}")
            return path.read_text(encoding="windows-1252")
    return None


@broker.task()
async def clear_sct_navdata(
    db_session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    for navaid in await db_session.scalars(select(Navaid).where(Navaid.source == "SCT")):
        _ = await db_session.delete(navaid)
    for ad in await db_session.scalars(select(Aerodrome).where(Aerodrome.source == "SCT")):
        _ = await db_session.delete(ad)
    logger.info("SCT navdata removed")


@broker.task()
async def import_sct(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    db_session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    airac_zip_url = await find_airac_zip_url(http_client)
    airac_zip = await fetch_airac_zip(http_client, airac_zip_url)
    airac_sct_file = extract_sct_file(airac_zip)

    if airac_sct_file:
        sct = sct_parser.parse(airac_sct_file)

        result = await db_session.scalars(select(Navaid.designator).where(Navaid.source == "DFS"))
        blocked_navaids = result.all()
        result = await db_session.scalars(
            select(Aerodrome.icao_designator).where(Aerodrome.source == "DFS"),
        )
        blocked_aerodromes = result.all()

        navaids_updated = navaids_added = 0
        filtered_navaids = [n for n in sct.navaids() if n.designator not in blocked_navaids]
        for navaid in filtered_navaids:
            stmt = select(Navaid).where(Navaid.designator == navaid.designator)
            existing = await db_session.scalar(stmt)
            if existing is not None:
                navaid.id = existing.id
                navaids_updated += 1
            else:
                navaids_added += 1
            _ = await db_session.merge(navaid)

        ads_updated = ads_added = 0
        filtered_aerodromes = [
            a for a in sct.aerodromes() if a.icao_designator not in blocked_aerodromes
        ]
        for aerodrome in filtered_aerodromes:
            stmt = select(Aerodrome).where(Aerodrome.icao_designator == aerodrome.icao_designator)
            existing = await db_session.scalar(stmt)
            if existing is not None:
                aerodrome.id = existing.id
                ads_updated += 1
            else:
                ads_added += 1
            _ = await db_session.merge(aerodrome)

        logger.info(
            f"SCT: Updated {navaids_updated} navaids (+{navaids_added}) and "
            + f"{ads_updated} aerodromes (+{ads_added})",
        )
