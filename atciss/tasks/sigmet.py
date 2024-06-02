from datetime import UTC, datetime, timedelta
from typing import Annotated

from aiohttp import ClientSession
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from taskiq_dependencies import Depends

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.db import get_session
from atciss.app.views.sigmet import Sigmet
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/10 * * * *"}])
async def fetch_sigmet(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    db_session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    async with http_client.get(
        "https://aviationweather.gov/api/data/isigmet?format=json&loc=eur",
    ) as res:
        try:
            sigmets = [Sigmet.model_validate(sigmet) for sigmet in await res.json()]
        except ValueError as e:
            logger.exception(f"Could not parse {e!s}")
            return

    if sigmets:
        for sigmet in sigmets:
            async with db_session.begin_nested():
                _ = await db_session.merge(sigmet)

        logger.info(f"Sigmet: Updated {len(sigmets)} SIGMETs")

    outdated_sigmets = await db_session.execute(
        select(Sigmet).where(Sigmet.validTimeTo <= datetime.now(tz=UTC) - timedelta(days=1))
    )
    for (sigmet,) in outdated_sigmets.all():
        logger.debug(f"Deleting outdated SIGMET {sigmet.isigmetId}")
        _ = await db_session.delete(sigmet)
