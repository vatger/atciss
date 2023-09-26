"""Application controllers - metar."""

from typing import Annotated, Dict, Sequence, Optional, cast
from fastapi import APIRouter, Depends, Query

from pydantic import TypeAdapter

from ..controllers.auth import get_user
from ..models import User

from ..utils.redis import RedisClient
from ..views.atis import Atis
from ..views.metar import AirportIcao


router = APIRouter()


@router.get(
    "/atis/",
)
async def atis_get(
    airports: Annotated[Sequence[AirportIcao], Query(alias="icao")],
    user: Annotated[User, Depends(get_user)],
) -> Dict[str, Atis]:
    """Get Atis for airport."""
    redis_client = RedisClient.open()

    atis = {}
    for icao in airports:
        icao = icao.upper()
        atis_json = cast(Optional[str], await redis_client.get(f"vatsim:atis:{icao}"))
        if atis_json is None:
            continue
        atis[icao] = TypeAdapter(Atis).validate_json(atis_json)

    return atis
