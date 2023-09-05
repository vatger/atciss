"""Application controllers - metar."""

from typing import Annotated, Dict, List, Optional, cast
from fastapi import APIRouter, Depends, Query

from pydantic import TypeAdapter

from atciss.app.controllers.auth import get_cid

from ..utils.redis import RedisClient
from ..views.atis import Atis


router = APIRouter()


@router.get(
    "/atis/",
    tags=["wx"],
)
async def atis_get(
    icao: Annotated[List[str], Query(...)], cid: Annotated[str, Depends(get_cid)]
) -> Dict[str, Atis]:
    """Get Atis for airport."""
    redis_client = RedisClient.open()

    atis = {}
    for i in icao:
        i = i.upper()
        atis_json = cast(Optional[str], await redis_client.get(f"vatsim:atis:{i}"))
        if atis_json is None:
            continue
        atis[i] = TypeAdapter(Atis).validate_json(atis_json)

    return atis
