from typing import Annotated, Sequence
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import aliased
from sqlmodel import select
from fastapi_async_sqlalchemy import db

from atciss.app.controllers.auth import get_user
from atciss.app.views.airway import AirwaySegment
from atciss.app.views.navaid import Navaid

from ..models import User

router = APIRouter()


@router.get("/navaid")
async def get_naviads(
    navaids: Annotated[Sequence[str], Query(alias="id", default_factory=list)],
    _: Annotated[User, Depends(get_user)],
) -> Sequence[Navaid]:
    async with db():
        stmt = select(Navaid).where(Navaid.designator.in_(navaids))
        results = await db.session.execute(stmt)

    return results.scalars().all()


@router.get("/navaid/search")
async def search_navaids(
    search: Annotated[str, Query(alias="q")],
    _: Annotated[User, Depends(get_user)],
) -> Sequence[Navaid]:
    async with db():
        stmt = select(Navaid).where(Navaid.designator.istartswith(search))
        results = await db.session.execute(stmt)

    return results.scalars().all()


@router.get("/navaid/airway/{airway_id}")
async def airway_navaids(
    airway_id: UUID,
    _: Annotated[User, Depends(get_user)],
) -> Sequence[Navaid]:
    async with db():
        end_as = aliased(AirwaySegment)
        navaids = await db.session.scalars(
            select(Navaid)
            .distinct()
            .outerjoin(AirwaySegment, Navaid.id == AirwaySegment.start_id)
            .outerjoin(end_as, Navaid.id == end_as.end_id)
            .where((AirwaySegment.airway_id == airway_id) | (end_as.airway_id == airway_id))
        )

    return navaids.all()
