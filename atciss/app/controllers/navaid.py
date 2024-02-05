from collections.abc import Sequence
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased
from sqlmodel import select

from atciss.app.controllers.auth import get_user
from atciss.app.utils.db import get_session
from atciss.app.views.airway import AirwaySegment
from atciss.app.views.dfs_aixm import Navaid

from ..models import User

router = APIRouter()


@router.get("/navaid")
async def get_naviads(
    navaids: Annotated[Sequence[str], Query(alias="id", default_factory=list)],
    _: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Sequence[Navaid]:
    stmt = select(Navaid).where(Navaid.designator.in_(navaids))
    results = await session.execute(stmt)

    return results.scalars().all()


@router.get("/navaid/search")
async def search_navaids(
    search: Annotated[str, Query(alias="q")],
    _: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Sequence[Navaid]:
    stmt = select(Navaid).where(Navaid.designator.istartswith(search))
    results = await session.execute(stmt)

    return results.scalars().all()


@router.get("/navaid/airway/{airway_id}")
async def airway_navaids(
    airway_id: UUID,
    _: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Sequence[Navaid]:
    end_as = aliased(AirwaySegment)
    navaids = await session.scalars(
        select(Navaid)
        .distinct()
        .outerjoin(AirwaySegment, Navaid.id == AirwaySegment.start_id)
        .outerjoin(end_as, Navaid.id == end_as.end_id)
        .where((AirwaySegment.airway_id == airway_id) | (end_as.airway_id == airway_id)),
    )

    return navaids.all()
