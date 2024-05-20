from collections.abc import Sequence
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import ORJSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from starlette.status import HTTP_204_NO_CONTENT, HTTP_404_NOT_FOUND

from atciss.app.utils.db import get_session
from atciss.app.views.initials import Initials, InitialsBase

from ..controllers.auth import get_fir_admin, get_user
from ..models import User

router = APIRouter()


@router.get(
    "/initials/{fir}",
    response_class=ORJSONResponse,
)
async def initials_get(
    fir: str,
    user: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Sequence[Initials]:
    """Get status for multiple sectors."""

    stmt = select(Initials).where(Initials.fir == fir)
    initials = await session.execute(stmt)

    return initials.scalars().all()


@router.post(
    "/initials/{fir}",
    response_class=ORJSONResponse,
)
async def initials_add(
    user: Annotated[User, Depends(get_fir_admin)],
    session: Annotated[AsyncSession, Depends(get_session)],
    initials: InitialsBase,
) -> Initials:
    """Set status for a sector."""

    db_initials = Initials.model_validate(initials, update={"id": uuid4()})
    session.add(db_initials)
    await session.commit()
    return db_initials


@router.delete("/initials/{fir}", response_class=ORJSONResponse, status_code=HTTP_204_NO_CONTENT)
async def initials_delete(
    user: Annotated[User, Depends(get_fir_admin)],
    session: Annotated[AsyncSession, Depends(get_session)],
    initials: Initials,
):
    """Set status for a sector."""

    db_initials = await session.get(Initials, initials.id)
    if db_initials is None:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND)
    await session.delete(db_initials)
    await session.commit()
