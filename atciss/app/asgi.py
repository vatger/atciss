"""Application implementation - ASGI."""
import logging

from fastapi import FastAPI

from ..config import settings
from .router import root_api_router
from .utils import RedisClient, AiohttpClient
from .tasks import fetch_loas, fetch_metar, fetch_notam, fetch_sector_data


log = logging.getLogger(__name__)


async def on_shutdown() -> None:
    """Shutdown event handler."""
    log.debug("Execute FastAPI shutdown event handler")
    await RedisClient.close()
    await AiohttpClient.close()


def get_application() -> FastAPI:
    """Initialize FastAPI application."""
    log.debug("Initialize FastAPI application node.")
    app = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG,
        version=settings.VERSION,
        docs_url=settings.DOCS_URL,
        on_startup=[fetch_loas, fetch_metar, fetch_notam, fetch_sector_data],
        on_shutdown=[on_shutdown],
    )
    log.debug("Add application routes.")
    app.include_router(root_api_router)

    return app
