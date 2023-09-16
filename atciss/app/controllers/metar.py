"""Application controllers - metar."""
import logging
from typing import Annotated, Dict, List, Optional, cast
from fastapi import APIRouter, Depends, Query
from metar.Metar import ParserError

from ..controllers.auth import get_user
from ..models import User

from ..views.metar import MetarModel
from ..utils.redis import RedisClient

router = APIRouter()

logger = logging.getLogger(__name__)


@router.get(
    "/metar/",
    tags=["wx"],
)
async def metar_get(
    icao: Annotated[List[str], Query(...)],
    user: Annotated[User, Depends(get_user)],
) -> Dict[str, MetarModel]:
    """Get METAR for airport."""
    redis_client = RedisClient.open()

    metars = {}
    for i in icao:
        i = i.upper()
        try:
            metar = cast(Optional[str], await redis_client.get(f"metar:{i}"))
            if metar is None:
                continue
            metars[i] = MetarModel.from_str(metar)
        except ParserError as e:
            logger.warn(e)

    return metars
