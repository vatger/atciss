import csv
from loguru import logger

from ..utils import RedisClient, ClientConnectorError, AiohttpClient


async def fetch_taf_metar() -> None:
    """Periodically fetch TAFs and METARs."""
    redis_client = await RedisClient.get()

    async with AiohttpClient.get() as aiohttp_client:
        for taf_metar in ["taf", "metar"]:
            try:
                res = await aiohttp_client.get(
                    "https://www.aviationweather.gov/adds/dataserver_current/current/"
                    + f"{taf_metar}s.cache.csv"
                )
            except ClientConnectorError as e:
                logger.error(f"Could not connect {str(e)}")
                return

            csv_data = csv.reader((await res.text()).split("\n"), delimiter=",")

            logger.info(f"{taf_metar.upper()}s received")

            async with redis_client.pipeline() as pipe:
                for c in csv_data:
                    if len(c) >= 2:
                        pipe.set(f"{taf_metar}:{c[1]}", c[0])
                await pipe.execute()
