import csv
import gzip
from typing import Annotated

from fastapi import Depends
from loguru import logger

from atciss.app.utils import AiohttpClient, ClientConnectorError, Redis, get_redis
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/1 * * * *"}])
async def fetch_taf_metar(
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch TAFs and METARs."""
    async with AiohttpClient.get() as aiohttp_client:
        for taf_metar in ["taf", "metar"]:
            try:
                res = await aiohttp_client.get(
                    f"https://aviationweather.gov/data/cache/{taf_metar}s.cache.csv.gz",
                )
                decompressed = gzip.decompress(await res.read())
            except ClientConnectorError as e:
                logger.error(f"Could not connect {e!s}")
                return

            csv_data = csv.reader(decompressed.decode("latin1").split("\n"), delimiter=",")

            logger.info(f"{taf_metar.upper()}s received")

            async with redis.pipeline() as pipe:
                for c in csv_data:
                    if len(c) >= 2:
                        pipe.set(f"{taf_metar}:{c[1]}", c[0])
                await pipe.execute()
