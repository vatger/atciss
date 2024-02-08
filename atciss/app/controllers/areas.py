"""Application controllers - Areas."""

from typing import Annotated, cast

from fastapi import APIRouter, Depends, HTTPException
from pydantic import TypeAdapter

from atciss.app.controllers.auth import get_user
from atciss.app.models import User
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.areas import AreaBooking

router = APIRouter()


@router.get(
    "/areas/",
    responses={404: {}},
)
async def get_areas(
    _: Annotated[User, Depends(get_user)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> list[AreaBooking]:
    """Get all area bookings from EAUP for today."""
    areas = cast(str | None, await redis.get("areas:bookings"))
    if areas is None:
        raise HTTPException(status_code=404)

    return TypeAdapter(list[AreaBooking]).validate_json(areas)
