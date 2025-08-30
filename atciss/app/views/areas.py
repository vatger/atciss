import json
import re
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, cast

from pydantic import (
    AwareDatetime,
    BaseModel,
    NaiveDatetime,
    TypeAdapter,
    field_validator,
    model_validator,
)

from ..utils.geo import Coordinate, convert_degsecmin_coordinate


def convert_point(point: str | Coordinate) -> Coordinate:
    if not isinstance(point, str):
        return point

    lat, ns, lng, we = re.findall(r"(\d+)(N|S)(\d+)(W|E)", point)[0]
    lat *= -1 if ns == "S" else 1
    lng *= -1 if we == "W" else 1
    return cast(
        "Coordinate",
        [convert_degsecmin_coordinate(lat), convert_degsecmin_coordinate(lng)],
    )


@dataclass
class EAUPHeader:
    prepared_on: NaiveDatetime
    valid_from: NaiveDatetime
    valid_until: NaiveDatetime


class AreaBooking(BaseModel):
    source: str
    name: str
    polygon: list[Coordinate]
    lower_limit: int
    upper_limit: int
    reservation_id: str | None
    creator: int | None
    callsigns: list[str] | None
    booking_type: str | None
    agency: str | None
    permeability: str | None
    activity_type: str | None
    nbr_acft: int | None
    priority: int | None
    start: AwareDatetime
    end: AwareDatetime
    remarks: str | None
    status: str | None


class DFSAreaBooking(BaseModel):
    name: str
    polygon: list[Coordinate]
    lower_limit: int
    upper_limit: int
    start_datetime: AwareDatetime
    end_datetime: AwareDatetime

    @field_validator("polygon", mode="before")
    @classmethod
    def polygon_validator(cls, inp: list[str | Coordinate]) -> list[Coordinate]:
        return [convert_point(point) for point in inp]

    @field_validator("lower_limit", "upper_limit", mode="before")
    @classmethod
    def limits_validator(cls, inp: int | str) -> int:
        if isinstance(inp, int):
            return inp

        if inp in ("GND", "MSL"):
            return 0

        return int(inp[1:], 10)

    @field_validator("start_datetime", "end_datetime", mode="before")
    @classmethod
    def force_utc(cls, inp: str) -> AwareDatetime:
        return TypeAdapter(datetime).validate_python(inp).replace(tzinfo=UTC)


class EAUPAreas(BaseModel):
    header: EAUPHeader
    areas: list[DFSAreaBooking]

    @model_validator(mode="before")
    @classmethod
    def prune_duplicates(cls, data: Any) -> Any:
        if isinstance(data["header"], EAUPHeader):
            return data

        return data | {
            "areas": [
                json.loads(a) for a in {json.dumps(area, sort_keys=True) for area in data["areas"]}
            ],
        }


class VLARAArea(BaseModel):
    area_id: str
    lower: int
    upper: int


class VLARAReservation(BaseModel):
    reservation_id: str
    creator: int
    callsigns: list[str]
    booking_type: str
    agency: str
    permeability: str
    activity_type: str
    nbr_acft: int
    priority: int
    start: datetime
    end: datetime
    remarks: str
    status: str
    areas: list[VLARAArea]
