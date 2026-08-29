from typing import Annotated

from fastapi import APIRouter, Depends

from atciss.app.controllers.auth import get_user
from atciss.app.models import User
from atciss.app.views.app_config import AppConfig
from atciss.config import settings

router = APIRouter()


@router.get(
    "/app-config",
)
async def app_config_get(
    _: Annotated[User, Depends(get_user)],
) -> AppConfig:
    """Retrieve backend-driven static app configuration."""
    return AppConfig(settings.CARTO_MAP_TOKEN)
