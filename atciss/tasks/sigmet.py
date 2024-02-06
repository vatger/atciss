from typing import Annotated

from aiohttp import ClientSession
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from taskiq_dependencies import Depends

from atciss.app.utils import get_aiohttp_client
from atciss.app.views.sigmet import Sigmet
from atciss.config import settings
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/10 * * * *"}])
async def fetch_sigmet(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
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
        engine = create_async_engine(
            url=str(settings.DATABASE_DSN),
        )

        async with AsyncSession(engine) as session:
            for sigmet in sigmets:
                _ = await session.merge(sigmet)

            await session.commit()

        logger.info(f"Sigmet: Updated {len(sigmets)} SIGMETs")
