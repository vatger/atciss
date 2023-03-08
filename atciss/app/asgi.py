"""Application implementation - ASGI."""
import csv
import logging

from fastapi import FastAPI

from ..config import settings
from .router import root_api_router
from .utils import RedisClient, AiohttpClient


log = logging.getLogger(__name__)


async def on_startup() -> None:
    """Startup event handler."""
    log.debug("Start FastAPI startup event handler")
    redis_client = await RedisClient.open()
    aiohttp_client = AiohttpClient.get()

    res = await aiohttp_client.get(
        "https://www.aviationweather.gov/adds/dataserver_current/current/"
        "metars.cache.csv"
    )
    metars_csv = csv.reader((await res.text()).split("\n"), delimiter=",")

    async with redis_client.pipeline() as pipe:
        for m in metars_csv:
            if len(m) >= 2:
                pipe.hmset("metar:{}".format(m[1]), {"raw": m[0]})
        await pipe.execute()


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
        on_startup=[on_startup],
        on_shutdown=[on_shutdown],
    )
    log.debug("Add application routes.")
    app.include_router(root_api_router)

    return app
