from aiohttp import ClientConnectorError
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from atciss.app.utils.aiohttp_client import AiohttpClient

from atciss.config import settings
from atciss.app.views.sigmet import Sigmet


async def fetch_sigmet() -> None:
    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get(
                "https://aviationweather.gov/api/data/isigmet?format=json&loc=eur",
            )
        except ClientConnectorError as e:
            logger.exception(f"Could not connect {e!s}")
            return

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
