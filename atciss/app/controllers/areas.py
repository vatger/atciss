from typing import Annotated, cast

from eaup.dfs import Dfs_Aup, parse_dfs_areas_to_eaup
from eaup.eaup import Eaup, EaupInfo, merge_to_eaup
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import ORJSONResponse
from pydantic import TypeAdapter

from atciss.app.controllers.auth import get_user
from atciss.app.models import User
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.areas import AreaBooking

router = APIRouter()


@router.get(
    "/areas",
    response_class=ORJSONResponse,
    responses={404: {}},
)
async def get_areas(
    _: Annotated[User, Depends(get_user)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> list[AreaBooking]:
    """Get all area bookings for today."""
    areas = cast("str | None", await redis.get("areas:bookings"))
    if areas is None:
        raise HTTPException(status_code=404)

    return TypeAdapter(list[AreaBooking]).validate_json(areas)


@router.get(
    "/areas/topsky",
    response_class=ORJSONResponse,
    responses={404: {}},
)
async def get_topsky_areas(
    redis: Annotated[Redis, Depends(get_redis)],
) -> Eaup:
    """Get topsky-compatible area bookings for today."""
    dfs_aup_str = cast("str | None", await redis.get("areas:dfs:aup"))
    if dfs_aup_str is None:
        raise HTTPException(status_code=404)

    dfs_aup = TypeAdapter(Dfs_Aup).validate_json(dfs_aup_str)
    dfs_areas = parse_dfs_areas_to_eaup(dfs_aup)
    return merge_to_eaup(
        info=EaupInfo(
            type="atciss",
            valid_wef=dfs_aup.header.valid_from,
            valid_til=dfs_aup.header.valid_until,
            released_on=dfs_aup.header.valid_from,
        ),
        area_list=dfs_areas,
    )
