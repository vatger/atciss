"""Application controllers - metar."""

from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from pydantic import TypeAdapter

from atciss.app.controllers.auth import get_cid

from ..utils.redis import RedisClient
from ..views.atis import Atis


router = APIRouter()


@router.get(
    "/atis/{icao}",
    tags=["wx"],
)
async def atis_get(icao: str, cid: Annotated[str, Depends(get_cid)]) -> Atis:
    """Get METAR for airport."""
    redis_client = RedisClient.open()
    icao = icao.upper()

    atis = await redis_client.get("vatsim:atis:{}".format(icao))
    if atis is None:
        raise HTTPException(status_code=404)

    return TypeAdapter(Atis).validate_json(atis)
