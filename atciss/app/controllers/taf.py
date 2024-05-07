from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import ORJSONResponse

from atciss.app.controllers.auth import get_user
from atciss.app.models import User
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.metar import AirportIcao

router = APIRouter()


async def fetch_taf(icao: AirportIcao, redis: Redis) -> str | None:
    taf = await redis.get(f"taf:{icao}")
    if taf is None:
        return None
    return taf


@router.get(
    "/taf",
    response_class=ORJSONResponse,
)
async def tafs_get(
    airports: Annotated[Sequence[AirportIcao], Query(alias="icao")],
    user: Annotated[User, Depends(get_user)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> dict[AirportIcao, str | None]:
    """Get taf for multiple airports."""
    return {apt: await fetch_taf(apt, redis) for apt in airports}


@router.get(
    "/taf/{icao}",
    responses={404: {}},
    response_class=ORJSONResponse,
)
async def taf_get(
    icao: AirportIcao,
    redis: Annotated[Redis, Depends(get_redis)],
) -> str | None:
    """Get taf for a single airport."""
    taf = await fetch_taf(icao, redis)
    if taf is None:
        raise HTTPException(status_code=404)
    return taf
