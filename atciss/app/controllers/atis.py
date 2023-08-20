"""Application controllers - metar."""
from fastapi import APIRouter, HTTPException
from pydantic import TypeAdapter

from ..views.atis import Atis

from ..utils.redis import RedisClient

router = APIRouter()


@router.get(
    "/atis/{icao}",
    tags=["wx"],
)
async def atis_get(icao: str) -> Atis:
    """Get METAR for airport."""
    redis_client = RedisClient.open()
    icao = icao.upper()

    atis = await redis_client.get("vatsim:atis:{}".format(icao))
    if atis is None:
        raise HTTPException(status_code=404)

    return TypeAdapter(Atis).validate_json(atis)
