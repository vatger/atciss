"""Application implementation - ASGI."""

from loguru import logger
from fastapi import FastAPI
from fastapi_async_sqlalchemy import SQLAlchemyMiddleware
from prometheus_fastapi_instrumentator import Instrumentator as PrometheusInstrumentator

from ..config import settings
from .router import root_api_router
from .utils import RedisClient
from ..log import setup_logging


async def on_shutdown() -> None:
    """Shutdown event handler."""
    logger.debug("Execute FastAPI shutdown event handler")
    await RedisClient.close()


def get_application() -> FastAPI:
    """Initialize FastAPI application."""
    setup_logging(level="DEBUG" if settings.DEBUG else "INFO")
    logger.debug("Initialize FastAPI application node.")

    app = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG,
        version=settings.VERSION,
        docs_url=settings.DOCS_URL,
        on_shutdown=[on_shutdown],
    )

    _ = PrometheusInstrumentator().instrument(app).expose(app, tags=["monitoring"])

    app.add_middleware(
        SQLAlchemyMiddleware,
        db_url=f"postgresql+asyncpg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}/{settings.POSTGRES_DB}",
        engine_args={  # engine arguments example
            "echo": True,
            "pool_pre_ping": True,
            "pool_size": 5,
            "max_overflow": 10,
        },
    )

    logger.debug("Add application routes.")
    app.include_router(root_api_router)

    return app
