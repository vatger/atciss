"""Application controllers - metar."""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from ..tasks.dfs_ad import Aerodrome
from ..utils.redis import RedisClient

from .auth import get_cid

router = APIRouter()


@router.get(
    "/ad/{icao}",
    tags=["wx"],
)
async def ad_get(icao: str, cid: Annotated[str, Depends(get_cid)]) -> Aerodrome:
    """Get METAR for airport."""
    redis_client = RedisClient.open()
    icao = icao.upper()

    ad = await redis_client.get(f"dfs:ad:{icao}")

    if ad is None:
        raise HTTPException(status_code=404)

    return Aerodrome.model_validate_json(ad)
