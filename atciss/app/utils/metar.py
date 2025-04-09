from typing import cast

from loguru import logger
from metar.Metar import ParserError

from atciss.app.utils.redis import Redis
from atciss.app.views.metar import AirportIcao, MetarModel


async def _fetch_metar(key: str, redis: Redis) -> MetarModel | None:
    try:
        metar = cast("str | None", await redis.get(key))
        if metar is None:
            return None

        parsed = MetarModel.from_str(metar)
        parsed.raw = metar
        return parsed  # noqa: TRY300
    except ParserError as e:
        logger.warning(e)
    return None


async def fetch_metar(icao: AirportIcao, redis: Redis) -> MetarModel | None:
    """Returns the current METAR for an aerodrome."""
    return await _fetch_metar(f"metar:{icao}", redis)


async def fetch_previous_metar(icao: AirportIcao, redis: Redis) -> MetarModel | None:
    """Returns the previous METAR for an aerodrome."""
    return await _fetch_metar(f"metar-prev:{icao}", redis)


async def get_metar_ts(icao: AirportIcao, redis: Redis) -> str | None:
    """Returns the timestamp of the METAR observation time"""
    return cast("str | None", await redis.get(f"metar-ts:{icao}"))


async def fetch_raw_metar(icao: AirportIcao, redis: Redis) -> str | None:
    return cast("str | None", await redis.get(f"metar:{icao}"))
