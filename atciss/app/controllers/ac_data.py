from typing import Annotated, Sequence

from fastapi import APIRouter, Depends
from fastapi_async_sqlalchemy import db
from sqlmodel import col, or_, select

from ..controllers.auth import get_user
from ..models import AircraftPerformanceData, User

router = APIRouter()


@router.get(
    "/aircraft/search",
)
async def ad_get(
    query: str,
    _: Annotated[User, Depends(get_user)],
) -> Sequence[AircraftPerformanceData]:
    if len(query) < 2:
        return []

    async with db():
        stmt = select(AircraftPerformanceData).where(
            or_(
                col(AircraftPerformanceData.icao_designator).icontains(query),
                col(AircraftPerformanceData.model).icontains(query),
                col(AircraftPerformanceData.manufacturer).icontains(query),
            )
        )
        results = await db.session.execute(stmt)

    return results.scalars().all()
