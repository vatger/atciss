"""Application controllers - metar."""
from typing import Annotated, cast
from fastapi import APIRouter, Depends, Query
from fastapi_async_sqlalchemy import db
from sqlmodel import select

from atciss.app.views.aerodrome import Aerodrome

from ..controllers.auth import get_user
from ..models import User

router = APIRouter()


@router.get("/aerodrome")
async def ad_get(
    icao: Annotated[list[str], Query(...)],
    user: Annotated[User, Depends(get_user)],
) -> dict[str, Aerodrome]:
    """Get METAR for airport."""
    async with db():
        stmt = select(Aerodrome).where(Aerodrome.icao_designator.in_(icao))
        results = await db.session.execute(stmt)

    return {cast(str, ad.icao_designator): ad for ad in results.scalars().all()}
