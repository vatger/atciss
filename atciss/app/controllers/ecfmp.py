"""Application controllers - ECFMP."""
from typing import Annotated, Optional, cast
from fastapi import APIRouter, Depends, HTTPException
from pydantic import TypeAdapter

from atciss.app.views.ecfmp import FlowMeasure

from ..controllers.auth import get_user
from ..models import User

from ..utils.redis import RedisClient

router = APIRouter()


@router.get(
    "/ecfmp/{fir}",
    responses={404: {}},
)
async def get_flow_measures(
    fir: str,
    user: Annotated[User, Depends(get_user)],
) -> list[FlowMeasure]:
    """Get ECFMP flow measures for a FIR."""
    async with RedisClient.open() as redis_client:
        flow_measures = cast(
            Optional[str], await redis_client.get(f"ecfmp:flow_measures:{fir}")
        )
        if flow_measures is None:
            raise HTTPException(status_code=404)

    return TypeAdapter(list[FlowMeasure]).validate_json(flow_measures)
