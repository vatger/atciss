from typing import Annotated, Literal
from fastapi import APIRouter, Depends
from sqlalchemy.orm import selectinload
from sqlmodel import select
from fastapi_async_sqlalchemy import db
from atciss.app.controllers.auth import get_user
from atciss.app.models import User

from atciss.app.views.airway import AirwaySegment, AirwaySegmentWithRefs


router = APIRouter()


@router.get("/airway/{hi_lo}", response_model=list[AirwaySegmentWithRefs])
async def get_airways(
    hi_lo: Literal["LOWER", "UPPER"],
    _: Annotated[User, Depends(get_user)],
):
    async with db():
        stmt = (
            select(AirwaySegment)
            .where(AirwaySegment.level.in_(["BOTH", hi_lo]))
            .options(selectinload("*"))
        )
        results = await db.session.scalars(stmt)

    return results.all()
