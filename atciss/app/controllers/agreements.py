"""Application controllers - metar."""
from datetime import UTC, datetime
from typing import Annotated
from fastapi_async_sqlalchemy import db
from fastapi import APIRouter, Body, Depends
from sqlmodel import select

from atciss.app.views.agreements import Agreements

from ..controllers.auth import get_controller, get_user
from ..models import User

router = APIRouter()


@router.get(
    "/agreements/{fir}",
)
async def sectorstatus_get(
    fir: str,
    user: Annotated[User, Depends(get_user)],
) -> Agreements:
    """Get status for multiple sectors."""

    stmt = select(Agreements).where(Agreements.fir == fir)
    agreements = await db.session.scalar(stmt)

    if agreements is None:
        return Agreements(fir=fir, text="", changed_by_cid="unset", updated_at=datetime.now(UTC))

    return agreements


@router.post(
    "/agreements/{fir}",
)
async def sectorstatus_post(
    fir: str,
    user: Annotated[User, Depends(get_controller)],
    text: Annotated[str, Body()] = "",
) -> Agreements:
    """Set status for a sector."""

    async with db():
        stmt = select(Agreements).where(Agreements.fir == fir)
        agreements = await db.session.scalar(stmt)

        if agreements is None:
            agreements = Agreements(
                fir=fir,
                text=text,
                changed_by_cid=str(user.cid),
                updated_at=datetime.now(UTC),
            )
        else:
            agreements.text = text
            agreements.changed_by_cid = str(user.cid)
            agreements.updated_at = datetime.now(UTC)

        agreements = await db.session.merge(agreements)
        await db.session.commit()

    return agreements
