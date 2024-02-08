from typing import Annotated

from aiohttp import ClientSession
from loguru import logger
from pydantic import TypeAdapter
from taskiq_dependencies import Depends

from atciss.app.utils import get_aiohttp_client
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.areas import AreaBooking, EAUPAreas
from atciss.tkq import broker


@broker.task(schedule=[{"cron": "*/10 * * * *"}])
async def fetch_areas(
    http_client: Annotated[ClientSession, Depends(get_aiohttp_client)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> None:
    """Periodically fetch active areas."""
    async with http_client.get(
        "https://eaup.vatsim.pt/api/v1/dfs/areas/",
    ) as res:
        eaup_areas = EAUPAreas.model_validate(await res.json())

    logger.info(f"EAUP Areas: {len(eaup_areas.areas)} areas received")

    async with redis.pipeline() as pipe:
        pipe.set(
            "areas:bookings",
            TypeAdapter(list[AreaBooking]).dump_json(eaup_areas.areas),
        )

        await pipe.execute()
