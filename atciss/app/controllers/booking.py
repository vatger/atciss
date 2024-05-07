from collections.abc import Sequence
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from fastapi.responses import ORJSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import and_, or_, select

from atciss.app.controllers.auth import get_user
from atciss.app.utils.db import get_session

from ..models import User
from ..views.booking import Booking

router = APIRouter()


@router.get(
    "/booking",
    response_class=ORJSONResponse,
)
async def get_bookings(
    prefixes: Annotated[Sequence[str], Query(alias="region", default_factory=list)],
    _: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Sequence[Booking]:
    start_filter = Booking.start > datetime.now(tz=UTC).today() - timedelta(days=14)
    prefix_filter = or_(*[Booking.callsign.startswith(p) for p in prefixes])
    stmt = select(Booking).where(and_(start_filter, prefix_filter))
    results = await session.execute(stmt)

    return results.scalars().all()
