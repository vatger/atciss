"""Application controllers - metar."""

from typing import Annotated, cast

from fastapi import APIRouter, Depends, Query
from pydantic import TypeAdapter

from ..utils.redis import RedisClient
from ..views.loa import LoaItem
from .auth import get_user

router = APIRouter()


@router.get(
    "/loa",
    tags=["loa"],
)
async def metar_get(
    sector: Annotated[list[str], Query(...)],
    cid: Annotated[str, Depends(get_user)],
) -> list[LoaItem]:
    """Get LOA for sector."""
    redis_client = RedisClient.open()

    loaitems = []
    for s in sector:
        s = s.upper()
        loaitems_json = cast(str | None, await redis_client.get(f"loa:{s}"))
        if loaitems_json is None:
            continue
        loaitems.extend(TypeAdapter(list[LoaItem]).validate_json(loaitems_json))

    return loaitems
