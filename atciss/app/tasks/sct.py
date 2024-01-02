from zipfile import ZipFile, Path
from io import BytesIO
from bs4 import BeautifulSoup
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlmodel import select
from atciss.app.utils.aiohttp_client import AiohttpClient

from atciss.app.views.aerodrome import Aerodrome
from atciss.app.views.navaid import Navaid

from ...config import settings
from ..views import sct_parser


async def find_airac_zip_url() -> str:
    async with AiohttpClient.get() as aiohttp_client:
        res = await aiohttp_client.get("http://files.aero-nav.com/EDXX")

        aeronav_html = BeautifulSoup(await res.text(), "html.parser")
        for link in aeronav_html.find_all("a"):
            url = link["href"]
            if "EDMM" in url and "AIRAC" in url and ".zip" in url:
                logger.info(f"AIRAC URL: {url}")
                return url

    raise RuntimeError("No EDMM AIRAC update found")


async def fetch_airac_zip(url: str) -> ZipFile:
    async with AiohttpClient.get() as aiohttp_client:
        async with aiohttp_client.get(
            url, headers={"referer": "https://files.aero-nav.com/EDXX/"}
        ) as res:
            zipbytes = await res.read()

    return ZipFile(BytesIO(zipbytes))


async def extract_sct_file(zipfile: ZipFile) -> str | None:
    for path in Path(zipfile).iterdir():
        if path.suffix == ".sct":
            logger.info(f".sct file: {path.name}")
            return path.read_text(encoding="windows-1252")


async def import_sct() -> None:
    airac_zip_url = await find_airac_zip_url()
    airac_zip = await fetch_airac_zip(airac_zip_url)
    airac_sct_file = await extract_sct_file(airac_zip)

    if airac_sct_file:
        sct = sct_parser.parse(airac_sct_file)
        engine = create_async_engine(
            url=str(settings.DATABASE_DSN),
        )

        async with AsyncSession(engine) as session:
            result = await session.scalars(select(Navaid.designator).where(Navaid.source == "DFS"))
            blocked_navaids = result.all()
            result = await session.scalars(
                select(Aerodrome.icao_designator).where(Aerodrome.source == "DFS")
            )
            blocked_aerodromes = result.all()

            filtered_navaids = [n for n in sct.navaids() if n.designator not in blocked_navaids]
            for navaid in filtered_navaids:
                _ = await session.merge(navaid)

            filtered_aerodromes = [
                a for a in sct.aerodromes() if a.icao_designator not in blocked_aerodromes
            ]
            for aerodrome in filtered_aerodromes:
                _ = await session.merge(aerodrome)

            await session.commit()

        logger.info(
            f"SCT: Updated {len(filtered_navaids)} navaids and {len(filtered_aerodromes)} aerodromes"
        )
