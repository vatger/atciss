"""Application controllers - Areas."""
from typing import Annotated, Optional, cast
from fastapi import APIRouter, Depends, HTTPException
from pydantic import TypeAdapter
from loguru import logger

from atciss.app.views.areas import AreaBooking

from ..controllers.auth import get_user
from ..models import User

from ..utils.redis import RedisClient

router = APIRouter()


@router.get(
    "/areas/",
    responses={404: {}},
)
async def get_areas(
    user: Annotated[User, Depends(get_user)],
) -> list[AreaBooking]:
    """Get all area bookings from EAUP for today."""
    async with RedisClient.open() as redis_client:
        areas = cast(Optional[str], await redis_client.get("areas:bookings"))
        if areas is None:
            raise HTTPException(status_code=404)

    return TypeAdapter(list[AreaBooking]).validate_json(areas)
