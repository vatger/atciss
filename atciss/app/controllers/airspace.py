"""Application controllers - metar."""
from fastapi import APIRouter, HTTPException
from pydantic import TypeAdapter

from ..views.atis import Atis

from ..utils.redis import RedisClient

router = APIRouter()


@router.get(
    "/airspace/{fir}",
    tags=["airspace"],
)
async def airspace_get(fir: str) -> Atis:
    """Get METAR for airport."""
    redis_client = RedisClient.open()
    fir = fir.upper()

    atis = await redis_client.get("vatsim:atis:{}".format(fir))
    if atis is None:
        raise HTTPException(status_code=404)

    return TypeAdapter(Atis).validate_json(atis)
