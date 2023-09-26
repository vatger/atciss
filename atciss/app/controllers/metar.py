"""Application controllers - metar."""
import re
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


def fixed_raw_metar(metar: str):
    # Sometimes visibilities only have 3 digits
    metar = re.sub(r" (\d{3}) ", r" 0\1 ", metar)
    # Color codes currently not supported
    metar = re.sub(r" ([A-Z/]{3})$", r" ", metar)
    return metar


async def fetch_metar(icao: AirportIcao) -> Optional[MetarModel]:
    async with RedisClient.open() as redis_client:
        try:
            metar = cast(Optional[str], await redis_client.get(f"metar:{icao}"))
            if metar is None:
                return None
            parsed = MetarModel.from_str(fixed_raw_metar(metar))
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
    metar = await fetch_metar(icao)
    if metar is None:
        raise HTTPException(status_code=404)
    return metar.raw


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
