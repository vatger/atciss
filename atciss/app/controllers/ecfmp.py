"""Application controllers - ECFMP."""
from typing import Annotated, Optional, cast
from fastapi import APIRouter, Depends, Query
from loguru import logger
from pydantic import TypeAdapter

from atciss.app.views.ecfmp import Event, FlowMeasure

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
        flow_measures = cast(Optional[str], await redis_client.get(f"ecfmp:flow_measures:{fir}"))
        if flow_measures is None:
            flow_measures = "[]"

    return TypeAdapter(list[FlowMeasure]).validate_json(flow_measures)


@router.get(
    "/event/",
    responses={404: {}},
)
async def get_events(
    fir: Annotated[list[str], Query(...)],
    user: Annotated[User, Depends(get_user)],
) -> list[Event]:
    """Get ECFMP flow measures for a FIR."""
    events = []
    async with RedisClient.open() as redis_client:
        for f in fir:
            fir_events = cast(Optional[str], await redis_client.get(f"ecfmp:events:{f}"))
            if fir_events is None:
                logger.warning(f"No event for {f}")
                continue
            events.extend(TypeAdapter(list[Event]).validate_json(fir_events))

    return events
