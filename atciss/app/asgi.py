"""Application implementation - ASGI."""

from contextlib import asynccontextmanager
from dataclasses import dataclass
from uuid import uuid4

from asgi_correlation_id import CorrelationIdMiddleware, correlation_id
from asgi_correlation_id.middleware import is_valid_uuid4
from asgiref.typing import (
    ASGI3Application,
    ASGIReceiveCallable,
    ASGISendCallable,
    Scope,
)
from fastapi import FastAPI
from loguru import logger
from prometheus_fastapi_instrumentator import Instrumentator as PrometheusInstrumentator

# for tasks discovery by broker
import atciss.tasks  # pyright: ignore # noqa: F401
from atciss.app.router import root_api_router
from atciss.app.utils.db import run_async_migrations
from atciss.app.utils.redis import redis_pool
from atciss.config import settings
from atciss.log import setup_logging
from atciss.tkq import broker


@dataclass
class CorrelationIdLogMiddleware:
    app: ASGI3Application

    async def __call__(
        self,
        scope: Scope,
        receive: ASGIReceiveCallable,
        send: ASGISendCallable,
    ) -> None:
        with logger.contextualize(id=correlation_id.get()):
            return await self.app(scope, receive, send)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if not broker.is_worker_process:
        await run_async_migrations()
        await broker.startup()
    yield
    if not broker.is_worker_process:
        await broker.shutdown()
        await redis_pool.disconnect()


def get_application() -> FastAPI:
    """Initialize FastAPI application."""
    setup_logging()
    logger.debug("Initialize FastAPI application.")

    app = FastAPI(
        title=settings.PROJECT_NAME,
        debug=settings.DEBUG,
        version=settings.VERSION,
        docs_url=settings.DOCS_URL,
        lifespan=lifespan,
    )

    _ = PrometheusInstrumentator().instrument(app).expose(app, tags=["monitoring"])

    app.add_middleware(CorrelationIdLogMiddleware)  # pyright: ignore
    app.add_middleware(
        CorrelationIdMiddleware,
        generator=(lambda: uuid4().hex) if not settings.DEBUG else (lambda: uuid4().hex[:8]),
        validator=is_valid_uuid4 if not settings.DEBUG else None,
    )

    logger.debug("Add application routes.")
    app.include_router(root_api_router)

    return app
