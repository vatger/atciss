from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse

from atciss.app.controllers.auth import get_user
from atciss.app.models import User
from atciss.app.utils.redis import Redis, get_redis

router = APIRouter()


@router.get(
    "/aliases/{fir}",
    responses={404: {}},
    response_class=PlainTextResponse,
)
async def get_areas(
    fir: str,
    user: Annotated[User, Depends(get_user)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> str:
    """Get EDMM aliases."""
    aliases = await redis.get(f"aliases:{fir}")
    if aliases is None:
        raise HTTPException(status_code=404)

    return aliases
