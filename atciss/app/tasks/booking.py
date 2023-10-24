from loguru import logger
from aiohttp import ClientConnectorError
from pydantic import TypeAdapter
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from ...config import settings
from ..views.booking import Booking, VatbookData

from ..utils import AiohttpClient


async def fetch_booking() -> None:
    """Periodically fetch sector data."""
    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get("https://atc-bookings.vatsim.net/api/booking")
        except ClientConnectorError as e:
            logger.error(f"Could not connect {str(e)}")
            return

        data = TypeAdapter(list[Booking]).validate_python(await res.json())

        try:
            res = await aiohttp_client.get("http://vatbook.euroutepro.com/xml2.php")
        except ClientConnectorError as e:
            logger.error(f"Could not connect {str(e)}")
            return

        try:
            vatbook_data = VatbookData.from_xml(await res.read())
        except Exception as e:
            logger.warning(e)
            raise e

    logger.info(f"Vatsim bookings received: {len(data)} bookings")
    logger.info(f"Vatbook bookings received: {len(vatbook_data.atcs.bookings)} bookings")

    engine = create_async_engine(
        url=str(settings.DATABASE_DSN),
    )

    async with AsyncSession(engine) as session:
        callsigns = await session.execute(select(Booking.callsign).distinct())
        data.extend(
            Booking.model_validate(b)
            for b in vatbook_data.atcs.bookings
            if b.callsign not in callsigns.all()
        )

        for booking in data:
            _ = await session.merge(booking)

        await session.commit()
