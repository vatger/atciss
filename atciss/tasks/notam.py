from typing import Annotated

from aiohttp import ClientSession
from fastapi import Depends
from loguru import logger
from parsimonious import ParseError
from pydantic import TypeAdapter
from pynotam import Notam
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.db import get_session
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.dfs_aixm import Aerodrome
from atciss.app.views.notam import NotamSeen, SourceNotam
from atciss.config import settings
from atciss.tkq import broker


def convert_notam(n: str) -> Notam | None:
    try:
        return Notam.from_str(f"({n.strip()})")
    except ParseError as e:
        logger.debug(f"could not parse notam: {n}\n{e}")

    return None


@broker.task(schedule=[{"cron": "45 * * * *"}])
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
    current_notam_ids = set()
    for notams_to_fetch in (
        all_icao[i * 50 : i * 50 + 50] for i in range(int(len(all_icao) / 50) + 1)
    ):
        logger.info(f"NOTAMs: fetching '{','.join(notams_to_fetch)}'")
        async with http_client.get(settings.NOTAM_URL + ",".join(notams_to_fetch)) as res:
            received_notams = TypeAdapter(list[SourceNotam]).validate_python(
                await res.json(), by_alias=True
            )

        for notam_elem in received_notams:
            notam = convert_notam(notam_elem.icao_translation)
            if notam is not None and len(notam.location) > 0:
                notams.append(notam)

    async with redis.pipeline() as pipe:
        for notam in notams:
            for location in notam.location:
                not_id = f"notam:{location}:{notam.notam_id}"
                current_notam_ids.add(not_id)
                _ = pipe.set(not_id, notam.full_text)
        logger.info(f"NOTAMs: {len(notams)} received")
        _ = await pipe.execute()

    # Remove old NOTAMs
    async with redis.pipeline() as pipe:
        for notam_key in await redis.keys("notam:*:*"):
            if notam_key not in current_notam_ids:
                logger.debug(f"Deleting NOTAM {notam_key}")
                res = await pipe.delete(notam_key)
                await res.execute()

                seens = await db_session.execute(
                    select(NotamSeen).where(NotamSeen.notam_id == notam_key.split(":")[2])
                )
                for (seen,) in seens.all():
                    logger.debug(f"Removing seen NOTAM record from {seen.cid}")
                    _ = await db_session.delete(seen)
