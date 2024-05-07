from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from fastapi.responses import ORJSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from atciss.app.controllers.auth import get_user
from atciss.app.utils.db import get_session
from atciss.app.views.sigmet import Sigmet

from ..models import User

router = APIRouter()


@router.get(
    "/sigmet",
    response_class=ORJSONResponse,
)
async def auth_config(
    firs: Annotated[Sequence[str], Query(alias="fir", default_factory=list)],
    user: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Sequence[Sigmet]:
    valid_filter = (Sigmet.validTimeFrom < datetime.now(UTC)) & (
        Sigmet.validTimeTo > datetime.now(UTC)
    )
    stmt = select(Sigmet).where(valid_filter & Sigmet.firId.in_(firs))
    results = await session.execute(stmt)

    return results.scalars().all()
