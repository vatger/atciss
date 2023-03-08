"""Application controllers - metar."""
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..utils.redis import RedisClient

router = APIRouter()
log = logging.getLogger(__name__)


class MetarModel(BaseModel):
    """METAR response model."""

    icao: str
    raw: str


@router.get(
    "/metar/{icao}",
    tags=["wx"],
)
async def metar_get(icao: str) -> MetarModel:
    """Get METAR for airport."""
    redis_client = RedisClient.open()

    metars = await redis_client.hmget("metar:{}".format(icao), "raw")
    if len(metars) < 1:
        raise HTTPException(status_code=404)

    return MetarModel(icao=icao, raw=metars[0])
