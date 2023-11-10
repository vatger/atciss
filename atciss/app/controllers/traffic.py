from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException

from ..controllers.auth import get_user
from ..models import User
from ..utils.redis import RedisClient
from ..views.vatsim import AerodromeTraffic

router = APIRouter()


@router.get(
    "/traffic",
)
async def ad_get(
    icao: str,
    _: Annotated[User, Depends(get_user)],
) -> AerodromeTraffic:
    redis_client = RedisClient.open()

    icao = icao.upper()
    traffic_json = cast(str | None, await redis_client.get(f"vatsim:traffic:{icao}"))
    if traffic_json is None:
        raise HTTPException(status_code=404, detail="No aerodrome traffic information found.")

    return AerodromeTraffic.model_validate_json(traffic_json)
