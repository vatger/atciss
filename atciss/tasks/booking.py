from datetime import UTC, datetime, timedelta
from typing import Annotated

from aiohttp import ClientSession
from loguru import logger
from pydantic import TypeAdapter
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from taskiq_dependencies import Depends

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.db import get_session
from atciss.app.views.booking import Booking
from atciss.tkq import broker


@broker.task()
async def fetch_booking(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    db_session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    """Periodically fetch bookings data."""
    async with http_client.get("https://atc-bookings.vatsim.net/api/booking") as res:
        bookings = TypeAdapter(list[Booking]).validate_python(await res.json())

    logger.info(f"Bookings received: {len(bookings)}")

    for booking in bookings:
        _ = await db_session.merge(booking)

    # Delete future bookings that were not in the fetched data (probably removed)
    removed_bookings = await db_session.execute(
        select(Booking)
        .where(Booking.start >= datetime.now(tz=UTC))
        .where(Booking.id.not_in(booking.id for booking in bookings))  # pylint: disable=no-member
    )
    for booking in removed_bookings.all():
        logger.debug(f"Deleting removed {booking}")
        db_session.delete(booking)

    # Remove old bookings
    old_bookings = await db_session.execute(
        select(Booking).where(Booking.end <= datetime.now(tz=UTC) - timedelta(days=1))
    )
    for booking in old_bookings.all():
        logger.debug(f"Deleting old {booking}")
        db_session.delete(booking)
