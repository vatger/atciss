"""Application controllers - metar."""
from typing import Annotated

from loguru import logger
from fastapi import APIRouter, Depends
from pydantic import TypeAdapter

from atciss.app.tasks.sectors import Airport, Airspace, Position, SectorData

from ..controllers.auth import get_user
from ..models import User
from ...config import settings

from ..utils.redis import RedisClient

router = APIRouter()


@router.get(
    "/airspace",
    tags=["airspace"],
)
async def airspace_get(
    user: Annotated[User, Depends(get_user)],
) -> SectorData:
    """Get METAR for airport."""
    redis_client = RedisClient.open()

    airspaces = {}
    airports = {}
    positions = {}
    for region in settings.SECTOR_REGIONS:
        airports_json = await redis_client.get(f"sector:airports:{region}")
        positions_json = await redis_client.get(f"sector:positions:{region}")
        airspaces_json = await redis_client.get(f"sector:airspaces:{region}")
        if airports_json is None or positions_json is None or airspaces_json is None:
            logger.warning(f"No data for {region}")
            continue

        airports = airports | TypeAdapter(dict[str, Airport]).validate_json(airports_json)
        positions = positions | TypeAdapter(dict[str, Position]).validate_json(positions_json)
        airspaces = airspaces | (TypeAdapter(dict[str, Airspace]).validate_json(airspaces_json))

    return SectorData(
        airspace=airspaces,
        groups={},
        positions=positions,
        callsigns={},
        airports=airports,
    )
