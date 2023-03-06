"""Application implementation - ASGI."""
import logging

from fastapi import FastAPI

from ..config import settings
from .router import root_api_router


log = logging.getLogger(__name__)


def get_application() -> FastAPI:
    """Initialize FastAPI application.

    Returns:
       FastAPI: Application object instance.
    """
    log.debug("Initialize FastAPI application node.")
    app = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG,
        version=settings.VERSION,
        docs_url=settings.DOCS_URL,
    )
    log.debug("Add application routes.")
    app.include_router(root_api_router)

    return app
