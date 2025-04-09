from collections.abc import Sequence
from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import ORJSONResponse, PlainTextResponse

from atciss.app.controllers.auth import get_user
from atciss.app.models import User
from atciss.app.utils.metar import fetch_metar, fetch_previous_metar
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.metar import AirportIcao, MetarTupleModel

router = APIRouter()


@router.get(
    "/metar",
    response_class=ORJSONResponse,
)
async def metars_get(
    airports: Annotated[Sequence[AirportIcao], Query(alias="icao")],
    _: Annotated[User, Depends(get_user)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> dict[AirportIcao, MetarTupleModel | None]:
    """Get METAR for multiple airports."""
    return {
        apt: MetarTupleModel(
            current=await fetch_metar(apt, redis), previous=await fetch_previous_metar(apt, redis)
        )
        for apt in airports
    }


@router.get(
    "/metar/raw",
    response_class=PlainTextResponse,
    responses={404: {}},
)
async def metar_raw_get(
    icao: Annotated[AirportIcao, Query(alias="id")],
    redis: Annotated[Redis, Depends(get_redis)],
) -> str:
    """Get METAR for a single airport. Compatible to metar.vatsim.net."""
    metar = cast("str | None", await redis.get(f"metar:{icao}"))
    if metar is None:
        raise HTTPException(status_code=404)

    return metar


@router.get(
    "/metar/{icao}",
    response_class=ORJSONResponse,
    responses={404: {}},
)
async def metar_get(
    icao: AirportIcao,
    redis: Annotated[Redis, Depends(get_redis)],
) -> MetarTupleModel | None:
    """Get METAR for a single airport."""
    metar = await fetch_metar(icao, redis)
    prev_metar = await fetch_previous_metar(icao, redis)
    if metar is None:
        raise HTTPException(status_code=404)
    return MetarTupleModel(current=metar, previous=prev_metar)
