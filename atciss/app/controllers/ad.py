"""Application controllers - metar."""
from typing import Annotated, cast
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from atciss.app.utils.db import get_session

from atciss.app.views.dfs_aixm import Aerodrome, AerodromeWithRunways

from ..controllers.auth import get_user
from ..models import User

router = APIRouter()


@router.get("/aerodrome", response_model=dict[str, AerodromeWithRunways])
async def ad_get(
    icao: Annotated[list[str], Query(...)],
    user: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> dict[str, Aerodrome]:
    """Get METAR for airport."""
    stmt = select(Aerodrome).where(Aerodrome.icao_designator.in_(icao))
    results = await session.execute(stmt)

    return {cast(str, ad.icao_designator): ad for ad in results.scalars().all()}
