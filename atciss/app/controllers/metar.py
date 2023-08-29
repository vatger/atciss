"""Application controllers - metar."""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from atciss.app.controllers.auth import get_cid

from ..views.metar import MetarModel

from ..utils.redis import RedisClient

router = APIRouter()


@router.get(
    "/metar/{icao}",
    tags=["wx"],
)
async def metar_get(icao: str, cid: Annotated[str, Depends(get_cid)]) -> MetarModel:
    """Get METAR for airport."""
    redis_client = RedisClient.open()
    icao = icao.upper()

    metar = await redis_client.get("metar:{}".format(icao))
    if metar is None:
        raise HTTPException(status_code=404)

    return MetarModel.from_str(metar)
