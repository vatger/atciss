"""Application controllers - metar."""
from typing import Annotated, Dict, Sequence, Optional, cast
from loguru import logger
from fastapi import APIRouter, Query, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from metar.Metar import ParserError

from ..controllers.auth import get_user
from ..models import User

from ..views.metar import MetarModel, AirportIcao
from ..utils.redis import RedisClient

router = APIRouter()


async def fetch_metar(icao: AirportIcao) -> Optional[MetarModel]:
    async with RedisClient.open() as redis_client:
        try:
            metar = cast(Optional[str], await redis_client.get(f"metar:{icao}"))
            if metar is None:
                return None
            parsed = MetarModel.from_str(metar)
            parsed.raw = metar
            return parsed
        except ParserError as e:
            logger.warning(e)
        return None


@router.get(
    "/metar",
)
async def metars_get(
    airports: Annotated[Sequence[AirportIcao], Query(alias="icao")],
    user: Annotated[User, Depends(get_user)],
) -> Dict[AirportIcao, Optional[MetarModel]]:
    """Get METAR for multiple airports."""
    return {apt: await fetch_metar(apt) for apt in airports}


@router.get(
    "/metar/raw",
    response_class=PlainTextResponse,
    responses={404: {}},
)
async def metar_raw_get(
    icao: Annotated[AirportIcao, Query(alias="id")],
) -> str:
    """Get METAR for a single airport. Compatible to metar.vatsim.net."""
    async with RedisClient.open() as redis_client:
        metar = cast(Optional[str], await redis_client.get(f"metar:{icao}"))
        if metar is None:
            raise HTTPException(status_code=404)

    return metar


@router.get(
    "/metar/{icao}",
    responses={404: {}},
)
async def metar_get(
    icao: AirportIcao,
) -> Optional[MetarModel]:
    """Get METAR for a single airport."""
    metar = await fetch_metar(icao)
    if metar is None:
        raise HTTPException(status_code=404)
    return metar
