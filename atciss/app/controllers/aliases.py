"""Application controllers - Areas."""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from ..controllers.auth import get_user
from ..models import User
from ..utils.redis import RedisClient

router = APIRouter()


@router.get(
    "/aliases/{fir}",
    responses={404: {}},
)
async def get_areas(
    fir: str,
    user: Annotated[User, Depends(get_user)],
) -> str:
    """Get EDMM aliases."""
    async with RedisClient.open() as redis_client:
        aliases = await redis_client.get(f"aliases:{fir}")
        if aliases is None:
            raise HTTPException(status_code=404)

    return aliases
