from typing import Annotated

from aiohttp import ClientSession
from fastapi import Depends
from loguru import logger
from pydantic import TypeAdapter

from atciss.app.utils import Redis, get_aiohttp_client, get_redis
from atciss.app.views.sector import Airport, Airspace, Position, SectorData
from atciss.config import settings
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/60 * * * *"}])
async def fetch_sector_data(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch sector data."""
    data: dict[str, SectorData] = {}

    for region in settings.SECTOR_REGIONS:
        async with http_client.get(
            "https://raw.githubusercontent.com/VATGER-Nav/vatglasses-data/"
            + f"atciss/data/{region}.json",
        ) as res:
            try:
                data[region] = TypeAdapter(SectorData).validate_python(
                    {"region": region} | await res.json(content_type="text/plain"),
                )
            except ValueError as e:
                logger.warning(e)

    logger.info("Sector data received")

    async with redis.pipeline() as pipe:
        for region, region_data in data.items():
            pipe.set(
                f"sector:airports:{region}",
                TypeAdapter(dict[str, Airport]).dump_json(region_data.airports),
            )
            pipe.set(
                f"sector:positions:{region}",
                TypeAdapter(dict[str, Position]).dump_json(region_data.positions),
            )
            pipe.set(
                f"sector:airspaces:{region}",
                TypeAdapter(dict[str, Airspace]).dump_json(region_data.airspace),
            )

        await pipe.execute()
