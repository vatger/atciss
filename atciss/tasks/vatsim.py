import re
from collections.abc import Sequence
from datetime import UTC, datetime, timedelta
from heapq import heappop, heappush
from typing import Annotated, cast

from aiohttp import ClientConnectorError
from fastapi import Depends
from haversine import Unit, haversine  # pyright: ignore
from loguru import logger
from pydantic import TypeAdapter
from vatsim.types import Atis, Controller, Pilot, VatsimData

from atciss.app.utils import AiohttpClient, Redis, get_redis
from atciss.app.views.basic_ad import BasicAD
from atciss.app.views.vatsim import AerodromeTraffic, Traffic
from atciss.tkq import broker


async def get_ad_name(icao: str, redis_client: Redis) -> str | None:
    ad_json = cast(str | None, await redis_client.get(f"basic:ad:{icao}"))
    if ad_json is None:
        return None

    ad = BasicAD.model_validate_json(ad_json)

    name = re.sub(r"\b(Airfield|Heliport|Airport|International)\b", "", ad.name)
    return re.sub(r"\s+", " ", name).strip()


@broker.task(schedule=[{"cron": "*/1 * * * *"}])
async def fetch_vatsim_data(
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch sector data."""

    async with AiohttpClient.get() as aiohttp_client:
        try:
            res = await aiohttp_client.get("https://data.vatsim.net/v3/vatsim-data.json")
        except ClientConnectorError as e:
            logger.error(f"Could not connect {e!s}")
            return

        data = TypeAdapter(VatsimData).validate_python(await res.json())

    controllers = [c for c in data.controllers if c.facility > 0]

    logger.info(
        f"Vatsim data received: {len(controllers)} controllers, "
        + f"{len(data.atis)} ATIS, {len(data.pilots)} pilots",
    )

    traffic = await calc_trafficboard_data(data.pilots, redis)

    async with redis.pipeline() as pipe:
        keys = await redis.keys("vatsim:atis:*")
        keys.extend(await redis.keys("vatsim:controller:*"))
        keys.extend(await redis.keys("vatsim:pilot:*"))
        keys.extend(await redis.keys("vatsim:traffic:*"))

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
                ),
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
        aerodrome="EDDM",
        arrivals=[heappop(arrs) for _ in range(len(arrs))],
        departures=deps,
    )


def time_estimate(distance: float, gs: float) -> float:
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
