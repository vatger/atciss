"""Application controllers - metar."""
from typing import Annotated, Dict, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import TypeAdapter

from atciss.app.controllers.auth import get_cid
from atciss.app.tasks.sectors import Airport, Airspace, Position, SectorData

from ..utils.redis import RedisClient

router = APIRouter()


@router.get(
    "/airspace/{region}",
    tags=["airspace"],
)
async def airspace_get(region: str, cid: Annotated[str, Depends(get_cid)]) -> SectorData:
    """Get METAR for airport."""
    redis_client = RedisClient.open()

    airports_json = await redis_client.get(f"sector:airports:{region}")
    positions_json = await redis_client.get( f"sector:positions:{region}")
    airspaces_json = await redis_client.get( f"sector:airspaces:{region}")
    if airports_json is None or positions_json is None or airspaces_json is None:
        raise HTTPException(status_code=404)

    airports = TypeAdapter(Dict[str, Airport]).validate_json(airports_json)
    positions = TypeAdapter(Dict[str, Position]).validate_json(positions_json)
    airspaces = TypeAdapter(List[Airspace]).validate_json(airspaces_json)


    return SectorData(airspace=airspaces, groups={}, positions=positions, callsigns={}, airports=airports)
