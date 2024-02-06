"""Application controllers - metar."""

from typing import Annotated

from fastapi import APIRouter, Depends
from loguru import logger
from pydantic import TypeAdapter

from atciss.app.controllers.auth import get_user
from atciss.app.models import User
from atciss.app.utils import Redis, get_redis
from atciss.app.views.sector import Airport, Airspace, Position, SectorData
from atciss.config import settings

router = APIRouter()


@router.get(
    "/airspace",
    tags=["airspace"],
)
async def airspace_get(
    user: Annotated[User, Depends(get_user)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> SectorData:
    """Get METAR for airport."""

    airspaces = {}
    airports = {}
    positions = {}

    for region in settings.SECTOR_REGIONS:
        airports_json = await redis.get(f"sector:airports:{region}")
        positions_json = await redis.get(f"sector:positions:{region}")
        airspaces_json = await redis.get(f"sector:airspaces:{region}")
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
