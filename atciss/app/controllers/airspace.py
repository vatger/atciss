"""Application controllers - metar."""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import TypeAdapter

from atciss.app.controllers.auth import get_cid

from ..views.atis import Atis

from ..utils.redis import RedisClient

router = APIRouter()


@router.get(
    "/airspace/{fir}",
    tags=["airspace"],
)
async def ad_get(fir: str, cid: Annotated[str, Depends(get_cid)]) -> Atis:
    """Get METAR for airport."""
    redis_client = RedisClient.open()
    fir = fir.upper()

    atis = await redis_client.get("vatsim:atis:{}".format(fir))
    if atis is None:
        raise HTTPException(status_code=404)

    return TypeAdapter(Atis).validate_json(atis)
