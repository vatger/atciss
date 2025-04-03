from typing import Annotated, cast

from fastapi import APIRouter, Depends, Query
from fastapi.responses import ORJSONResponse
from loa import Doc
from pydantic import TypeAdapter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from atciss.app.controllers.auth import get_user
from atciss.app.utils.db import get_session
from atciss.app.utils.redis import Redis, get_redis
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


@router.get(
    "/loa/docs/{fir}",
    response_class=ORJSONResponse,
)
async def get_loa_docs(
    fir: str,
    redis: Annotated[Redis, Depends(get_redis)],
) -> list[Doc]:
    """Get LoA docs for the given FIR."""
    raw_docs = cast("str | None", await redis.get("loa-docs:index"))
    if raw_docs is None:
        raw_docs = "[]"

    docs = TypeAdapter(list[Doc]).validate_json(raw_docs)

    fir_docs = []
    related_docs = []
    for doc in docs:
        if fir in doc.firs:
            fir_docs.append(doc)

        if doc.related_firs and fir in doc.related_firs:
            related_docs.append(doc)

    fir_docs.extend(related_docs)
    return fir_docs
