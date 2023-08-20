"""Application controllers - metar."""
import logging
from typing import cast

from fastapi import APIRouter, HTTPException

from ..views.notam import NotamModel, NotamsPerLocationModel

from ..utils.redis import RedisClient

router = APIRouter()
log = logging.getLogger(__name__)


@router.get(
    "/notam/{icao}",
    tags=["notam"],
)
async def noram_get(icao: str) -> NotamsPerLocationModel:
    """Get METAR for airport."""
    redis_client = RedisClient.open()
    icao = icao.upper()

    notam_keys = await redis_client.keys("notam:{}:*".format(icao))
    notams = await redis_client.mget(notam_keys)
    notams = cast(list[str], notams)
    if len(notams) < 1:
        raise HTTPException(status_code=404)

    notams = [NotamModel.from_str(n) for n in notams]

    return NotamsPerLocationModel(icao=icao, notams=notams)
