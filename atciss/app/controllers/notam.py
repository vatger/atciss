from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import ORJSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import delete, select

from atciss.app.controllers.auth import get_user
from atciss.app.models import User
from atciss.app.utils.db import get_session
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.notam import NotamModel, NotamSeen

router = APIRouter()


@router.get(
    "/notam",
    response_class=ORJSONResponse,
)
async def notam_get(
    icao: Annotated[list[str], Query(...)],
    _: Annotated[User, Depends(get_user)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> dict[str, list[NotamModel]]:
    """Get METAR for airport."""
    notams: dict[str, list[NotamModel]] = {}

    for i in icao:
        i = i.upper()
        notam_keys = await redis.keys(f"notam:{i}:*")
        notam_text = cast(list[str], await redis.mget(notam_keys))
        icao_notams = [NotamModel.from_str(n) for n in notam_text]
        notams[i] = icao_notams

    if len(notams) < 1:
        raise HTTPException(status_code=404)

    return notams


@router.get(
    "/notam/read",
    response_class=ORJSONResponse,
)
async def notam_seen_get(
    user: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> Sequence[str]:
    stmt = select(NotamSeen.notam_id).where(NotamSeen.cid == str(user.cid))
    read_notams = await session.scalars(stmt)

    return read_notams.all()


@router.post(
    "/notam/read",
)
async def notam_seen(
    id: str,
    user: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    """Get METAR for airport."""
    _ = await session.merge(NotamSeen(notam_id=id, cid=str(user.cid), seen_at=datetime.now(UTC)))
    await session.commit()


@router.delete(
    "/notam/read",
)
async def notam_unseen(
    id: str,
    user: Annotated[User, Depends(get_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    """Get METAR for airport."""
    stmt = delete(NotamSeen).where(NotamSeen.notam_id == id).where(NotamSeen.cid == str(user.cid))
    _ = await session.execute(stmt)
    await session.commit()
