"""Application controllers - metar."""
from datetime import datetime
import logging
from typing import Dict, List, Optional, Set, cast
from typing_extensions import Self

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from pynotam import Notam

from ..utils.redis import RedisClient

router = APIRouter()
log = logging.getLogger(__name__)


class NotamModel(BaseModel):
    full_text: str
    notam_id: str
    notam_type: str
    ref_notam_id: Optional[str]
    fir: str
    notam_code: str
    traffic_type: Set[str]
    purpose: Set[str]
    scope: Set[str]
    fl_lower: int
    fl_upper: int
    area: Dict[str, str | int]
    location: List[str]
    valid_from: datetime
    valid_till: datetime
    schedule: Optional[str]
    body: str
    limit_lower: Optional[str]
    limit_upper: Optional[str]
    source: Optional[str]
    created: Optional[datetime]

    @classmethod
    def from_str(cls, raw: str) -> Self:
        notam = Notam.from_str(raw)
        return cls(
            full_text=notam.full_text,
            notam_id=notam.notam_id,
            notam_type=notam.notam_type,
            ref_notam_id=notam.ref_notam_id,
            fir=notam.fir,
            notam_code=notam.notam_code,
            traffic_type=notam.traffic_type,
            purpose=notam.purpose,
            scope=notam.scope,
            fl_lower=notam.fl_lower,
            fl_upper=notam.fl_upper,
            area=notam.area,
            location=notam.location,
            valid_from=notam.valid_from,
            valid_till=notam.valid_till,
            schedule=notam.schedule,
            body=notam.body,
            limit_lower=notam.limit_lower,
            limit_upper=notam.limit_upper,
            source=notam.source,
            created=notam.created,
        )

        # The following contain [start,end) indices for their corresponding NOTAM items (if such exist).
        # They can be used to index into Notam.full_text.
        # indices_item_a: Optional[Tuple[int, int]] = None
        # indices_item_b: Optional[Tuple[int, int]] = None
        # indices_item_c: Optional[Tuple[int, int]] = None
        # indices_item_d: Optional[Tuple[int, int]] = None
        # indices_item_e: Optional[Tuple[int, int]] = None
        # indices_item_f: Optional[Tuple[int, int]] = None
        # indices_item_g: Optional[Tuple[int, int]] = None

class NotamsPerLocationModel(BaseModel):
    """METAR response model."""

    icao: str
    notams: List[NotamModel]


@router.get(
    "/notam/{icao}",
    tags=["notam"],
)
async def noram_get(icao: str) -> NotamsPerLocationModel:
    """Get METAR for airport."""
    redis_client = RedisClient.open()
    icao = icao.upper()

    notam_keys = await redis_client.keys("notam:{}:*".format(icao))
    notams = await redis_client.mget(notam_keys)
    notams = cast(list[str], notams)
    if len(notams) < 1:
        raise HTTPException(status_code=404)

    notams = [NotamModel.from_str(n) for n in notams]

    return NotamsPerLocationModel(icao=icao, notams=notams)
