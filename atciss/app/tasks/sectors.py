import logging
from aiohttp import ClientConnectorError

from pydantic import TypeAdapter

from ..views.sector import Airport, Airspace, Position, SectorData

from ..utils import AiohttpClient, RedisClient, repeat_every

log = logging.getLogger(__name__)

# check https://github.com/lennycolton/vatglasses-data/tree/main/data
SECTOR_REGIONS = ["austria", "czechia", "germany"]
# TODO add italy, poland and switzerland when available


@repeat_every(seconds=3600, logger=log)
async def fetch_sector_data() -> None:
    """Periodically fetch sector data."""
    redis_client = await RedisClient.open()
    aiohttp_client = AiohttpClient.get()

    data: dict[str, SectorData] = {}
    for region in SECTOR_REGIONS:
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
