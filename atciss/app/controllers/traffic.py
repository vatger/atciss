from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException

from atciss.app.controllers.auth import get_user
from atciss.app.models import User
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.vatsim import AerodromeTraffic

router = APIRouter()


@router.get(
    "/traffic",
)
async def ad_get(
    icao: str,
    _: Annotated[User, Depends(get_user)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> AerodromeTraffic:
    icao = icao.upper()
    traffic_json = cast(str | None, await redis.get(f"vatsim:traffic:{icao}"))
    if traffic_json is None:
        raise HTTPException(status_code=404, detail="No aerodrome traffic information found.")

    return AerodromeTraffic.model_validate_json(traffic_json)
