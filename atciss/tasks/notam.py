from datetime import UTC, datetime, timedelta
from typing import Annotated, cast

from aiohttp import ClientSession
from bs4 import BeautifulSoup
from fastapi import Depends
from loguru import logger
from parsimonious import ParseError
from pynotam import Notam
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.db import get_session
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.dfs_aixm import Aerodrome
from atciss.app.views.notam import NotamModel, NotamSeen
from atciss.config import settings
from atciss.tkq import broker


def convert_notam(n: str) -> Notam | None:
    try:
        return Notam.from_str(f"({n.strip()})")
    except ParseError as e:
        logger.debug(f"could not parse notam: {n}\n{e}")

    return None


@broker.task(schedule=[{"cron": "20 4 * * *"}])
async def fetch_notam(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    redis: Annotated[Redis, Depends(get_redis)],
    db_session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    """Periodically fetch relevant NOTAMs."""
    all_icao = settings.FIRS
    ads = await db_session.execute(
        select(Aerodrome).where(
            Aerodrome.icao_designator.startswith("ED") | Aerodrome.icao_designator.startswith("ET")
        )
    )
    for (ad,) in ads.fetchall():
        all_icao.append(ad.icao_designator)

    notams = []
    for notams_to_fetch in (
        all_icao[i * 50 : i * 50 + 50] for i in range(int(len(all_icao) / 50) + 1)
    ):
        logger.info(f"NOTAMs: fetching '{'+'.join(notams_to_fetch)}'")
        async with http_client.get(
            "https://notams.geht.jetzt/dinsQueryWeb/queryRetrievalMapAction.do"
            + f"?reportType=Raw&retrieveLocId={'+'.join(notams_to_fetch)}"
            + "&actionType=notamRetrievalByICAOs&submit=View+NOTAMs",
        ) as res:
            logger.info(f"NOTAMs: response '{res.status} {res.reason}'")
            notam_html = BeautifulSoup(await res.text(), "html.parser")

        for notam_elem in notam_html.find_all("pre"):
            notam = convert_notam(notam_elem.string)
            if notam is not None and len(notam.location) > 0:
                notams.append(notam)

    async with redis.pipeline() as pipe:
        for notam in notams:
            for location in notam.location:
                pipe.set(f"notam:{location}:{notam.notam_id}", notam.full_text)
        logger.info(f"NOTAMs: {len(notams)} received")
        await pipe.execute()

    # Remove old NOTAMs
    notam_keys = await redis.keys("notam:*:*")
    notam_text = cast(list[str], await redis.mget(notam_keys))
    icao_notams = [NotamModel.from_str(n) for n in notam_text]
    async with redis.pipeline() as pipe:
        for notam in icao_notams:
            if notam.valid_till <= datetime.now(tz=UTC) - timedelta(days=7):
                logger.debug(f"Deleting NOTAM {notam.location}:{notam.notam_id}")
                res = await pipe.delete(*[
                    f"notam:{location}:{notam.notam_id}" for location in notam.location
                ])
                await res.execute()

                seens = await db_session.execute(
                    select(NotamSeen).where(NotamSeen.notam_id == notam.notam_id)
                )
                for (seen,) in seens.all():
                    logger.debug(f"Removing seen NOTAM record from {seen.cid}")
                    _ = await db_session.delete(seen)
