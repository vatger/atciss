import csv
import gzip
from typing import Annotated

from aiohttp import ClientSession
from fastapi import Depends
from loguru import logger

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.metar import fetch_raw_metar, get_metar_ts
from atciss.app.utils.redis import Redis, get_redis
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/1 * * * *"}])
async def fetch_taf_metar(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch TAFs and METARs."""
    async with http_client.get(
        "https://aviationweather.gov/data/cache/metars.cache.csv.gz",
    ) as res:
        decompressed = gzip.decompress(await res.read())

    csv_data = csv.reader(decompressed.decode("latin1").split("\n"), delimiter=",")

    logger.info("METARs received")

    async with redis.pipeline() as pipe:
        for c in csv_data:
            # Filter status headers sometimes appearing as well as column description
            if len(c) < 2 or c[0] == "raw_text":
                continue

            try:
                new_value, icao, new_ts, *_ = c

                old_value = await fetch_raw_metar(icao, redis)
                old_ts = await get_metar_ts(icao, redis)

                if old_ts is None or new_ts > old_ts:
                    # Initializing first time: New value is old value
                    _ = pipe.set(f"metar-prev:{icao}", old_value or new_value)
                    _ = pipe.set(f"metar:{icao}", new_value)
                    _ = pipe.set(f"metar-ts:{icao}", new_ts)
            except ValueError as e:
                logger.warning(f"metar parsing failed: {e}")
        _ = await pipe.execute()
