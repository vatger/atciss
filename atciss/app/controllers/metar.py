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
    icao = icao.upper()

    metar = await redis_client.get("metar:{}".format(icao))
    if metar is None:
        raise HTTPException(status_code=404)

    return MetarModel(icao=icao, raw=metar)
