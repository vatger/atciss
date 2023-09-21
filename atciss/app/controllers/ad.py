"""Application controllers - metar."""
from typing import Annotated, Dict, List, cast
from fastapi import APIRouter, Depends, Query

from ..controllers.auth import get_user
from ..models import User

from ..tasks.dfs_ad import Aerodrome
from ..utils.redis import RedisClient

router = APIRouter()


@router.get(
    "/aerodrome/",
)
async def ad_get(
    icao: Annotated[List[str], Query(...)],
    user: Annotated[User, Depends(get_user)],
) -> Dict[str, Aerodrome]:
    """Get METAR for airport."""
    redis_client = RedisClient.open()

    ads = {}
    for i in icao:
        i = i.upper()
        ad_json = cast(str, await redis_client.get(f"dfs:ad:{i}"))
        ads[i] = Aerodrome.model_validate_json(ad_json)

    return ads
