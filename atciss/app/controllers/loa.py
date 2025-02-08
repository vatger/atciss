from typing import Annotated, cast

from fastapi import APIRouter, Depends, Query
from fastapi.responses import ORJSONResponse
from pydantic import TypeAdapter

from atciss.app.controllers.auth import get_user
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
    redis: Annotated[Redis, Depends(get_redis)],
) -> list[LoaItem]:
    """Get LOA for sector."""
    loaitems = []
    for s in sector:
        s = s.upper()
        loaitems_json = cast("str | None", await redis.get(f"loa:{s}"))
        if loaitems_json is None:
            continue
        loaitems.extend(TypeAdapter(list[LoaItem]).validate_json(loaitems_json))

    return loaitems
