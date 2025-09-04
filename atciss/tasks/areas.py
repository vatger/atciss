from typing import Annotated, cast

import aiohttp
import geojson  # pyright: ignore[reportMissingTypeStubs]
from eaup.dfs import Dfs_Aup, get_dfs_areas  # pyright: ignore[reportMissingTypeStubs]
from loguru import logger
from pydantic import TypeAdapter
from taskiq_dependencies import Depends

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.areas import AreaBooking, DFSAreaBooking, EAUPAreas, VLARAReservation
from atciss.config import settings
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/30 * * * *"}])
async def fetch_dfs_areas(
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch active areas."""
    dfs_aup = get_dfs_areas()
    eaup_areas = EAUPAreas.model_validate(dfs_aup.model_dump())

    logger.info(f"EAUP Areas: {len(eaup_areas.areas)} areas received")

    async with redis.pipeline() as pipe:
        _ = pipe.set(
            "areas:dfs:aup",
            TypeAdapter(Dfs_Aup).dump_json(dfs_aup),
        )
        _ = pipe.set(
            "areas:dfs:bookings",
            TypeAdapter(list[DFSAreaBooking]).dump_json(eaup_areas.areas),
        )

        _ = await pipe.execute()


@broker.task(schedule=[{"cron": "*/10 * * * *"}])
async def fetch_vlara_bookings(
    redis: Annotated[Redis, Depends(get_redis)],
    http_client: Annotated[aiohttp.ClientSession, Depends(get_aiohttp_client)],
) -> None:
    async with http_client.get(settings.VLARA_URL) as response:
        json = await response.json()
        bookings = TypeAdapter(list[VLARAReservation]).validate_python(json)

    logger.info(f"vLARA Areas: {len(bookings)} bookings received")

    async with redis.pipeline() as pipe:
        _ = pipe.set(
            "areas:vlara:bookings", TypeAdapter(list[VLARAReservation]).dump_json(bookings)
        )
        _ = await pipe.execute()


@broker.task(schedule=[{"cron": "*/8 * * * *"}])
async def calculate_area_bookings(
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    areas = cast("str | None", await redis.get("areas:dfs:bookings"))
    dfs_bookings = TypeAdapter(list[DFSAreaBooking]).validate_json(areas or "[]")

    areas = cast("str | None", await redis.get("areas:vlara:bookings"))
    vlara_bookings = TypeAdapter(list[VLARAReservation]).validate_json(areas or "[]")

    raw_vlara_areas = cast("str | None", await redis.get("areas:vlara"))
    vlara_areas = geojson.loads(raw_vlara_areas)
    vlara_area_map = {ar.properties["name"]: ar for ar in vlara_areas.features}

    bookings = []
    for db in dfs_bookings:
        bookings.append(
            AreaBooking(
                name=db.name,
                start=db.start_datetime,
                end=db.end_datetime,
                source="dfs_aup",
                polygon=db.polygon,
                lower_limit=db.lower_limit,
                upper_limit=db.upper_limit,
                reservation_id=None,
                creator=None,
                callsigns=None,
                activity_type=None,
                agency=None,
                booking_type=None,
                permeability=None,
                nbr_acft=None,
                priority=None,
                remarks=None,
                status=None,
            )
        )

    for lb in vlara_bookings:
        for area in lb.areas:
            bookings.append(
                AreaBooking(
                    name=area.area_id,
                    start=lb.start,
                    end=lb.end,
                    source="vlara",
                    polygon=[x[::-1] for x in vlara_area_map[area.area_id].geometry.coordinates[0]],
                    lower_limit=area.lower,
                    upper_limit=area.upper,
                    reservation_id=lb.reservation_id,
                    creator=lb.creator,
                    callsigns=lb.callsigns,
                    activity_type=lb.activity_type,
                    agency=lb.agency,
                    booking_type=lb.booking_type,
                    permeability=lb.permeability,
                    nbr_acft=lb.nbr_acft,
                    priority=lb.priority,
                    remarks=lb.remarks,
                    status=lb.status,
                )
            )

    logger.info(f"Calculated area bookings: (combined) {len(bookings)} bookings")

    async with redis.pipeline() as pipe:
        _ = pipe.set("areas:bookings", TypeAdapter(list[AreaBooking]).dump_json(bookings))
        _ = await pipe.execute()


@broker.task(schedule=[{"cron": "23 4 * * *"}])
async def fetch_vlara_areas(
    redis: Annotated[Redis, Depends(get_redis)],
    http_client: Annotated[aiohttp.ClientSession, Depends(get_aiohttp_client)],
) -> None:
    async with http_client.get(settings.VLARA_AREA_URL) as response:
        json = await response.text()

    logger.info("vLARA Area Definitions updated")

    async with redis.pipeline() as pipe:
        _ = pipe.set("areas:vlara", json)
        _ = await pipe.execute()
