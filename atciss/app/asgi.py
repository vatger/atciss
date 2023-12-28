"""Application implementation - ASGI."""

from contextlib import asynccontextmanager

from dataclasses import dataclass
from uuid import uuid4

from loguru import logger
from asgiref.typing import (
    ASGI3Application,
    ASGIReceiveCallable,
    ASGISendCallable,
    Scope,
)
from fastapi import FastAPI
from fastapi_async_sqlalchemy import SQLAlchemyMiddleware
from prometheus_fastapi_instrumentator import Instrumentator as PrometheusInstrumentator
from asgi_correlation_id import CorrelationIdMiddleware, correlation_id
from asgi_correlation_id.middleware import is_valid_uuid4

from sqlalchemy.ext.asyncio import create_async_engine

import alembic.command
import alembic.config

from ..config import settings
from .router import root_api_router
from .utils import RedisClient
from ..log import setup_logging


@dataclass
class CorrelationIdLogMiddleware:
    app: ASGI3Application

    async def __call__(
        self, scope: Scope, receive: ASGIReceiveCallable, send: ASGISendCallable
    ) -> None:
        with logger.contextualize(id=correlation_id.get()):
            return await self.app(scope, receive, send)


def run_migrations(connection, cfg):
    cfg.attributes["connection"] = connection
    alembic.command.upgrade(cfg, "head")


async def run_async_migrations():
    alembic_cfg = alembic.config.Config(settings.ALEMBIC_CFG_PATH)
    engine = create_async_engine(
        url=str(settings.DATABASE_DSN),
    )

    async with engine.begin() as conn:
        await conn.run_sync(run_migrations, alembic_cfg)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await run_async_migrations()
    yield
    await RedisClient.close()


def get_application() -> FastAPI:
    """Initialize FastAPI application."""
    setup_logging()
    logger.debug("Initialize FastAPI application node.")

    app = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG,
        version=settings.VERSION,
        docs_url=settings.DOCS_URL,
        lifespan=lifespan,
    )

    _ = PrometheusInstrumentator().instrument(app).expose(app, tags=["monitoring"])

    app.add_middleware(
        SQLAlchemyMiddleware,
        db_url=str(settings.DATABASE_DSN),
        engine_args={  # engine arguments example
            "pool_pre_ping": True,
            "pool_size": 5,
            "max_overflow": 10,
        },
    )

    app.add_middleware(CorrelationIdLogMiddleware)
    app.add_middleware(
        CorrelationIdMiddleware,
        generator=(lambda: uuid4().hex) if not settings.DEBUG else (lambda: uuid4().hex[:8]),
        validator=is_valid_uuid4 if not settings.DEBUG else None,
    )

    logger.debug("Add application routes.")
    app.include_router(root_api_router)

    return app
