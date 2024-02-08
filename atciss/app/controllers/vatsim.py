"""Application controllers - VATSIM data."""

from typing import Annotated, cast

from fastapi import APIRouter, Depends
from pydantic import TypeAdapter
from vatsim.types import Controller

from atciss.app.controllers.auth import get_user
from atciss.app.models import User
from atciss.app.utils.redis import Redis, get_redis

router = APIRouter()


@router.get(
    "/vatsim/controllers",
)
async def controllers_get(
    _: Annotated[User, Depends(get_user)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> list[Controller]:
    """Get online Vatsim controllers."""
    controllers = []
    controller_keys = await redis.keys("vatsim:controller:*")
    for c in controller_keys:
        controller_json = cast(str | None, await redis.get(c))
        if controller_json is None:
            continue
        controllers.append(TypeAdapter(Controller).validate_json(controller_json))

    return controllers
