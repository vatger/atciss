"""Application controllers - metar."""
from fastapi import APIRouter, HTTPException

from ..views.metar import MetarModel

from ..utils.redis import RedisClient

router = APIRouter()


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

    return MetarModel.from_str(metar)
