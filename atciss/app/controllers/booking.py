"""Application controllers - booking."""
from datetime import datetime, timedelta
from typing import Annotated, Sequence
from fastapi import APIRouter, Depends, Query
from sqlmodel import and_, or_, select
from fastapi_async_sqlalchemy import db

from atciss.app.controllers.auth import get_user

from ..views.booking import Booking

from ..models import User

router = APIRouter()


@router.get("/booking")
async def auth_config(
    prefixes: Annotated[Sequence[str], Query(alias="region", default_factory=list)],
    user: Annotated[User, Depends(get_user)],
) -> Sequence[Booking]:
    async with db():
        start_filter = Booking.start > datetime.today() - timedelta(days=14)
        prefix_filter = or_(*[Booking.callsign.startswith(p) for p in prefixes])
        stmt = select(Booking).where(and_(start_filter, prefix_filter))
        results = await db.session.execute(stmt)

    return results.scalars().all()
