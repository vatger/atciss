import csv
import gzip
from typing import Annotated

from aiohttp import ClientSession
from fastapi import Depends
from loguru import logger

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.redis import Redis, get_redis
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/1 * * * *"}])
async def fetch_taf_metar(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch TAFs and METARs."""
    for taf_metar in ["taf", "metar"]:
        async with http_client.get(
            f"https://aviationweather.gov/data/cache/{taf_metar}s.cache.csv.gz",
        ) as res:
            decompressed = gzip.decompress(await res.read())

        csv_data = csv.reader(decompressed.decode("latin1").split("\n"), delimiter=",")

        logger.info(f"{taf_metar.upper()}s received")

        async with redis.pipeline() as pipe:
            for c in csv_data:
                if len(c) >= 2:
                    pipe.set(f"{taf_metar}:{c[1]}", c[0])
            await pipe.execute()
