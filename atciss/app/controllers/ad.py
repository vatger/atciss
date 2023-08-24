"""Application controllers - metar."""
from fastapi import APIRouter, HTTPException

from atciss.app.tasks.dfs_ad import Aerodrome

from ..utils.redis import RedisClient

router = APIRouter()


@router.get(
    "/ad/{icao}",
    tags=["wx"],
)
async def ad_get(icao: str) -> Aerodrome:
    """Get METAR for airport."""
    redis_client = RedisClient.open()
    icao = icao.upper()

    ad = await redis_client.get(f"dfs:ad:{icao}")

    if ad is None:
        raise HTTPException(status_code=404)

    return Aerodrome.model_validate_json(ad)
