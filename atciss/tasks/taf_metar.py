import csv
import gzip
from typing import Annotated

from aiohttp import ClientSession
from fastapi import Depends
from loguru import logger

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.metar import fetch_raw_metar
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.utils.taf import fetch_taf
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
                try:
                    if len(c) < 2 or c[0] == "raw_text":
                        continue

                    prev_value = (
                        await fetch_raw_metar(c[1], redis)
                        if taf_metar == "metar"
                        else await fetch_taf(c[1], redis)
                    )
                    if prev_value is not None:
                        if taf_metar == "metar":
                            prev_metar_ts = int(prev_value.split(" ")[1][:-1])
                            new_metar_ts = int(c[0].split(" ")[1][:-1])

                            # Only replace newer METARs
                            if prev_metar_ts > new_metar_ts:
                                continue

                            if prev_metar_ts != new_metar_ts:
                                _ = pipe.set(f"{taf_metar}-prev:{c[1]}", prev_value)
                        else:
                            if prev_value != c[0]:
                                _ = pipe.set(f"{taf_metar}-prev:{c[1]}", prev_value)
                    else:
                        # Initialize with old METAR/TAF if nothing found
                        _ = pipe.set(f"{taf_metar}-prev:{c[1]}", c[0])

                    _ = pipe.set(f"{taf_metar}:{c[1]}", c[0])
                except ValueError as e:
                    logger.warning(f"{taf_metar} parsing failed: {e}")
            _ = await pipe.execute()
