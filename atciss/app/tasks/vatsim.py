import re
from datetime import UTC, datetime, timedelta
from heapq import heappush, heappop
from typing import Sequence, cast, Optional

from haversine import haversine, Unit
from loguru import logger
from aiohttp import ClientConnectorError
from pydantic import TypeAdapter
from redis.asyncio import Redis

from ..utils import AiohttpClient, RedisClient
from ..views.basic_ad import BasicAD
from ..views.atis import Atis
from ..views.vatsim import Controller, Pilot, VatsimData, AerodromeTraffic, Traffic


async def get_ad_name(icao: str, redis_client: Optional[Redis] = None) -> Optional[str]:
    if redis_client is None:
        redis_client = RedisClient.get()

    ad_json = cast(str | None, await redis_client.get(f"basic:ad:{icao}"))
    if ad_json is None:
        return None

    ad = BasicAD.model_validate_json(ad_json)

    name = re.sub(r"\b(Airfield|Heliport|Airport|International)\b", "", ad.name)
    return re.sub(r"\s+", " ", name).strip()


async def fetch_vatsim_data(redis_client: Optional[Redis] = None) -> None:
    """Periodically fetch sector data."""
    if redis_client is None:
        redis_client = await RedisClient.get()

    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get("https://data.vatsim.net/v3/vatsim-data.json")
        except ClientConnectorError as e:
            logger.error(f"Could not connect {str(e)}")
            return

        data = TypeAdapter(VatsimData).validate_python(await res.json())

    controllers = [c for c in data.controllers if c.facility > 0]

    logger.info(
        f"Vatsim data received: {len(controllers)} controllers, "
        + f"{len(data.atis)} ATIS, {len(data.pilots)} pilots"
    )

    traffic = await calc_trafficboard_data(data.pilots, redis_client)

    async with redis_client.pipeline() as pipe:
        keys = await redis_client.keys("vatsim:atis:*")
        keys.extend(await redis_client.keys("vatsim:controller:*"))
        keys.extend(await redis_client.keys("vatsim:pilot:*"))
        keys.extend(await redis_client.keys("vatsim:traffic:*"))

        if len(keys):
            _ = pipe.delete(*keys)

        for atis in data.atis:
            pipe.set(f"vatsim:atis:{atis.callsign}", TypeAdapter(Atis).dump_json(atis))

        for controller in controllers:
            pipe.set(
                f"vatsim:controller:{controller.callsign}",
                TypeAdapter(Controller).dump_json(controller),
            )

        for pilot in data.pilots:
            pipe.set(f"vatsim:pilot:{pilot.callsign}", TypeAdapter(Pilot).dump_json(pilot))

        pipe.set("vatsim:traffic:EDDM", TypeAdapter(AerodromeTraffic).dump_json(traffic))

        await pipe.execute()


async def calc_trafficboard_data(pilots: Sequence[Pilot], redis_client: Redis) -> AerodromeTraffic:
    arrs: list[Traffic] = []
    deps: list[Traffic] = []

    arp = (48.353783944, 11.786084889)

    for pilot in pilots:
        if not pilot.flight_plan:
            continue

        dist = haversine(arp, (pilot.latitude, pilot.longitude), Unit.NAUTICAL_MILES)

        if pilot.flight_plan.departure == "EDDM" and pilot.groundspeed < 50 and dist < 10:
            deps.append(
                Traffic.from_pilot(
                    pilot,
                    eta=None,
                    dep=await get_ad_name(pilot.flight_plan.departure, redis_client),
                    arr=await get_ad_name(pilot.flight_plan.arrival, redis_client),
                )
            )

        if pilot.flight_plan.arrival == "EDDM" and pilot.groundspeed > 50:
            minutes_to_touch = time_estimate(dist, pilot.groundspeed)
            heappush(
                arrs,
                Traffic.from_pilot(
                    pilot,
                    eta=datetime.now(UTC) + timedelta(minutes=minutes_to_touch),
                    dep=await get_ad_name(pilot.flight_plan.departure, redis_client),
                    arr=await get_ad_name(pilot.flight_plan.arrival, redis_client),
                ),
            )

    return AerodromeTraffic(
        aerodrome="EDDM", arrivals=[heappop(arrs) for _ in range(len(arrs))], departures=deps
    )


def time_estimate(distance, gs) -> float:
    time = 0

    # 15 miles final-ish
    time += min(15, max(0, distance - 15)) * 60 / min(140, gs)
    distance -= 15

    if distance < 0:
        return time

    # 20 miles approach
    time += min(20, max(0, distance - 20)) * 60 / min(200, gs * 0.9)
    distance -= 20

    if distance < 0:
        return time

    return time + distance * 60 / gs
