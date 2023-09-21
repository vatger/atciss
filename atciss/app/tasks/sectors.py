import logging
from aiohttp import ClientConnectorError

from pydantic import TypeAdapter

from ..views.sector import Airport, Airspace, Position, SectorData

from ..utils import AiohttpClient, RedisClient

from ...config import settings

log = logging.getLogger(__name__)


async def fetch_sector_data() -> None:
    """Periodically fetch sector data."""
    redis_client = await RedisClient.get()

    async with AiohttpClient.get() as aiohttp_client:
        data: dict[str, SectorData] = {}
        for region in settings.SECTOR_REGIONS:
            try:
                res = await aiohttp_client.get(
                    "https://raw.githubusercontent.com/globin/vatglasses-data/germany-sector-abbrv/data"
                    + f"/{region}.json"
                )
            except ClientConnectorError as e:
                log.error(f"Could not connect {str(e)}")
                return

            data[region] = TypeAdapter(SectorData).validate_python(
                await res.json(content_type="text/plain")
            )

    log.info("Sector data received")

    async with redis_client.pipeline() as pipe:
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
                TypeAdapter(list[Airspace]).dump_json(region_data.airspace),
            )
        await pipe.execute()
