from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import ORJSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col, or_, select

from atciss.app.utils.db import get_session

from ..controllers.auth import get_user
from ..models import AircraftPerformanceData, User

router = APIRouter()


@router.get(
    "/aircraft/search",
    response_class=ORJSONResponse,
)
async def ad_get(
    query: str,
    _: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Sequence[AircraftPerformanceData]:
    if len(query) < 2:
        return []

    stmt = select(AircraftPerformanceData).where(
        or_(
            col(AircraftPerformanceData.icao_designator).icontains(query),
            col(AircraftPerformanceData.model).icontains(query),
            col(AircraftPerformanceData.manufacturer).icontains(query),
        ),
    )
    results = await session.execute(stmt)

    return results.scalars().all()
