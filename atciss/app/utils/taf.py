from typing import cast

from atciss.app.utils.redis import Redis
from atciss.app.views.metar import AirportIcao


async def fetch_taf(icao: AirportIcao, redis: Redis) -> str | None:
    taf = await redis.get(f"taf:{icao}")
    if taf is None:
        return None
    return taf


async def get_taf_ts(icao: AirportIcao, redis: Redis) -> str | None:
    """Returns the timestamp of the TAF issuance time"""
    return cast("str | None", await redis.get(f"taf-ts:{icao}"))
