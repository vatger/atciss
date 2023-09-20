"""Application controllers - metar."""
import logging
from typing import Annotated, List, Optional, cast
from fastapi import APIRouter, Depends, Query
from pydantic import TypeAdapter

from .auth import get_user
from ..views.loa import LoaItem

from ..utils.redis import RedisClient

router = APIRouter()

logger = logging.getLogger(__name__)


@router.get(
    "/loa/",
    tags=["loa"],
)
async def metar_get(
    sector: Annotated[List[str], Query(...)], cid: Annotated[str, Depends(get_user)]
) -> List[LoaItem]:
    """Get LOA for sector."""
    redis_client = RedisClient.open()

    loaitems = []
    for s in sector:
        s = s.upper()
        loaitems_json = cast(Optional[str], await redis_client.get(f"loa:{s}"))
        if loaitems_json is None:
            continue
        loaitems.extend(TypeAdapter(List[LoaItem]).validate_json(loaitems_json))

    return loaitems
