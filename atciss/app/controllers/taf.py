"""Application controllers - taf."""

from collections.abc import Sequence
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from atciss.app.views.metar import AirportIcao

from ..controllers.auth import get_user
from ..models import User
from ..utils.redis import RedisClient

router = APIRouter()


async def fetch_taf(icao: AirportIcao) -> str | None:
    redis_client = RedisClient.open()
    taf = await redis_client.get(f"taf:{icao}")
    if taf is None:
        return None
    return taf


@router.get(
    "/taf",
)
async def tafs_get(
    airports: Annotated[Sequence[AirportIcao], Query(alias="icao")],
    user: Annotated[User, Depends(get_user)],
) -> dict[AirportIcao, str | None]:
    """Get taf for multiple airports."""
    return {apt: await fetch_taf(apt) for apt in airports}


@router.get(
    "/taf/{icao}",
    responses={404: {}},
)
async def taf_get(icao: AirportIcao) -> str | None:
    """Get taf for a single airport."""
    taf = await fetch_taf(icao)
    if taf is None:
        raise HTTPException(status_code=404)
    return taf
