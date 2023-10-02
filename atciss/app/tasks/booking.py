from loguru import logger
from aiohttp import ClientConnectorError
from pydantic import TypeAdapter
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

from ...config import settings
from ..views.booking import Booking

from ..utils import AiohttpClient


async def fetch_booking() -> None:
    """Periodically fetch sector data."""
    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get(
                "https://atc-bookings.vatsim.net/api/booking"
            )
        except ClientConnectorError as e:
            logger.error(f"Could not connect {str(e)}")
            return

        data = TypeAdapter(list[Booking]).validate_python(await res.json())

    logger.info(f"Vatsim bookings received: {len(data)} bookings")

    engine = create_async_engine(
        url=str(settings.DATABASE_DSN),
    )

    async with AsyncSession(engine) as session:
        for booking in data:
            _ = await session.merge(booking)

        await session.commit()
