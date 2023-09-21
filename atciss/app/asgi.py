"""Application implementation - ASGI."""
import logging

from fastapi import FastAPI
from fastapi_async_sqlalchemy import SQLAlchemyMiddleware
from fastapi_async_sqlalchemy import db
from prometheus_fastapi_instrumentator import Instrumentator as PrometheusInstrumentator

from .tasks.dfs_ad import fetch_dfs_ad_data
from .tasks.loa import fetch_loas
from .tasks.metar import fetch_metar
from .tasks.notam import fetch_notam
from .tasks.sectors import fetch_sector_data
from .tasks.vatsim import fetch_vatsim_data

from ..config import settings
from .router import root_api_router
from .utils import RedisClient, AiohttpClient


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
        on_startup=[
            fetch_loas,
            fetch_metar,
            fetch_notam,
            fetch_sector_data,
            fetch_vatsim_data,
            fetch_dfs_ad_data,
        ],
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

    log.debug("Add application routes.")
    app.include_router(root_api_router)

    return app
