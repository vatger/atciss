from typing import Annotated

from fastapi import APIRouter, Depends, Query
from fastapi.responses import ORJSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from atciss.app.controllers.auth import get_user
from atciss.app.utils.db import get_session
from atciss.app.views.loa import LoaItem

router = APIRouter()


@router.get(
    "/loa",
    response_class=ORJSONResponse,
)
async def metar_get(
    sector: Annotated[list[str], Query(...)],
    cid: Annotated[str, Depends(get_user)],
    db_session: Annotated[AsyncSession, Depends(get_session)],
) -> list[LoaItem]:
    """Get LOA for sector."""

    items = await db_session.scalars(
        select(LoaItem).where(LoaItem.from_sector.in_(sector) | LoaItem.to_sector.in_(sector))
    )

    return items
