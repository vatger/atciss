import csv
import logging

from ..utils import RedisClient, ClientConnectorError, AiohttpClient

# from atciss.celery import app as celery_app

log = logging.getLogger(__name__)


# @celery_app.task(name="update_metar")
async def fetch_metar() -> None:
    """Periodically fetch METARs."""
    redis_client = await RedisClient.get()

    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get(
                "https://www.aviationweather.gov/adds/dataserver_current/current/"
                + "metars.cache.csv"
            )
        except ClientConnectorError as e:
            log.error(f"Could not connect {str(e)}")
            return

        metars_csv = csv.reader((await res.text()).split("\n"), delimiter=",")

    log.info("METARs received")

    async with redis_client.pipeline() as pipe:
        for m in metars_csv:
            if len(m) >= 2:
                pipe.set(f"metar:{m[1]}", m[0])
        await pipe.execute()
