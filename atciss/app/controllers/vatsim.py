"""Application controllers - VATSIM data."""

from typing import Annotated, List, Optional, cast

from fastapi.responses import PlainTextResponse
from fastapi import APIRouter, Depends

from pydantic import TypeAdapter

from ...config.application import settings
from ..views.vatsim import Controller
from ..controllers.auth import get_user
from ..models import User

from ..utils.redis import RedisClient


router = APIRouter()


@router.get(
    "/vatsim/status",
    response_class=PlainTextResponse,
)
async def vatsim_status_get() -> str:
    data = {
        "url0": "http://data.vatsim.net/vatsim-data.txt",
        "json3": "https://data.vatsim.net/v3/vatsim-data.json",
        "url1": "http://data.vatsim.net/vatsim-servers.txt",
        "servers.live": "http://data.vatsim.net/vatsim-servers.txt",
        "metar0": f"{settings.BASE_URL}/api/metar/raw",
        "user0": "http://stats.vatsim.net/search_id.php",
        "voice0": "afv",
    }
    return "\n".join(f"{key}={value}" for key, value in data.items())


@router.get(
    "/vatsim/controllers",
)
async def controllers_get(
    user: Annotated[User, Depends(get_user)],
) -> List[Controller]:
    """Get online Vatsim controllers."""
    redis_client = RedisClient.open()

    controllers = []
    controller_keys = await redis_client.keys("vatsim:controller:*")
    for c in controller_keys:
        controller_json = cast(Optional[str], await redis_client.get(c))
        if controller_json is None:
            continue
        controllers.append(TypeAdapter(Controller).validate_json(controller_json))

    return controllers
