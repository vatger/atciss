from typing import Annotated, Sequence
from fastapi import APIRouter, Depends, Query
from sqlmodel import select
from fastapi_async_sqlalchemy import db

from atciss.app.controllers.auth import get_user

from ..models import Navaid, User

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
