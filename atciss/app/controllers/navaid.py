from typing import Annotated, Sequence
from fastapi import APIRouter, Depends, Query
from sqlmodel import select
from fastapi_async_sqlalchemy import db

from atciss.app.controllers.auth import get_user
from atciss.app.views.navaid import NavaidModel

from ..views.booking import Booking

from ..models import Navaid, User

router = APIRouter()


@router.get("/navaid")
async def get_naviads(
    navaids: Annotated[Sequence[str], Query(alias="id")],
    _: Annotated[User, Depends(get_user)],
) -> Sequence[NavaidModel]:
    aids = []

    for aid in navaids:
        async with db():
            stmt = select(Navaid).where(Navaid.designator == aid)
            results = await db.session.execute(stmt)
            mapped_results = [NavaidModel.from_db(a) for a in results.scalars().all()]
            aids.extend(mapped_results)

    return aids
