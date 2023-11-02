from loguru import logger
from aiohttp import ClientConnectorError
from pydantic import TypeAdapter

from ..utils import AiohttpClient, RedisClient
from ..views.atis import Atis
from ..views.vatsim import Controller, Pilot, VatsimData


async def fetch_vatsim_data() -> None:
    """Periodically fetch sector data."""
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

    async with redis_client.pipeline() as pipe:
        keys = await redis_client.keys("vatsim:atis:*")
        keys.extend(await redis_client.keys("vatsim:controller:*"))
        keys.extend(await redis_client.keys("vatsim:pilot:*"))

        if len(keys):
            _ = await redis_client.delete(*keys)

        for atis in data.atis:
            pipe.set(f"vatsim:atis:{atis.callsign}", TypeAdapter(Atis).dump_json(atis))

        for controller in controllers:
            pipe.set(
                f"vatsim:controller:{controller.callsign}",
                TypeAdapter(Controller).dump_json(controller),
            )

        for pilot in data.pilots:
            pipe.set(f"vatsim:pilot:{pilot.callsign}", TypeAdapter(Pilot).dump_json(pilot))

        await pipe.execute()
