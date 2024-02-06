"""Application controllers - ECFMP."""

from typing import Annotated, cast

from fastapi import APIRouter, Depends, Query
from loguru import logger
from pydantic import TypeAdapter

from atciss.app.controllers.auth import get_user
from atciss.app.models import User
from atciss.app.utils import Redis, get_redis
from atciss.app.views.ecfmp import Event, FlowMeasure

router = APIRouter()


@router.get(
    "/ecfmp/{fir}",
    responses={404: {}},
)
async def get_flow_measures(
    fir: str,
    user: Annotated[User, Depends(get_user)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> list[FlowMeasure]:
    """Get ECFMP flow measures for a FIR."""
    flow_measures = cast(str | None, await redis.get(f"ecfmp:flow_measures:{fir}"))
    if flow_measures is None:
        flow_measures = "[]"

    return TypeAdapter(list[FlowMeasure]).validate_json(flow_measures)


@router.get(
    "/event",
    responses={404: {}},
)
async def get_events(
    fir: Annotated[list[str], Query(...)],
    user: Annotated[User, Depends(get_user)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> list[Event]:
    """Get ECFMP flow measures for a FIR."""
    events = []
    for f in fir:
        fir_events = cast(str | None, await redis.get(f"ecfmp:events:{f}"))
        if fir_events is None:
            logger.warning(f"No event for {f}")
            continue
        events.extend(TypeAdapter(list[Event]).validate_json(fir_events))

    return events
