from atciss.app.utils.redis import Redis
from atciss.app.views.metar import AirportIcao


async def fetch_taf(icao: AirportIcao, redis: Redis) -> str | None:
    taf = await redis.get(f"taf:{icao}")
    if taf is None:
        return None
    return taf
