"""Application controllers - booking."""
from datetime import UTC, datetime
from typing import Annotated, Sequence
from fastapi import APIRouter, Depends, Query
from sqlmodel import select
from fastapi_async_sqlalchemy import db

from atciss.app.controllers.auth import get_user
from atciss.app.views.sigmet import Sigmet

from ..models import User

router = APIRouter()


@router.get("/sigmet")
async def auth_config(
    firs: Annotated[Sequence[str], Query(alias="fir", default_factory=list)],
    user: Annotated[User, Depends(get_user)],
) -> Sequence[Sigmet]:
    async with db():
        valid_filter = (Sigmet.validTimeFrom < datetime.now(UTC)) & (
            Sigmet.validTimeTo > datetime.now(UTC)
        )
        stmt = select(Sigmet).where(valid_filter & Sigmet.firId.in_(firs))
        results = await db.session.execute(stmt)

    return results.scalars().all()
