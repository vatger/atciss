"""Application controllers - metar."""
import logging
from typing import List, cast

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# from pynotam import Notam

from ..utils.redis import RedisClient

router = APIRouter()
log = logging.getLogger(__name__)


class NotamModel(BaseModel):
    """METAR response model."""

    icao: str
    notams: List[str]


@router.get(
    "/notam/{icao}",
    tags=["notam"],
)
async def noram_get(icao: str) -> NotamModel:
    """Get METAR for airport."""
    redis_client = RedisClient.open()
    icao = icao.upper()

    notam_keys = await redis_client.keys("notam:{}:*".format(icao))
    notams = await redis_client.mget(notam_keys)
    notams = cast(list[str], notams)
    if len(notams) < 1:
        raise HTTPException(status_code=404)

    # notams = [Notam.from_str(n) for n in notams]

    return NotamModel(icao=icao, notams=notams)
