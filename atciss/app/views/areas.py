from dataclasses import dataclass
from datetime import UTC, datetime
import json
from typing import Any, cast
from pydantic import (
    AwareDatetime,
    NaiveDatetime,
    BaseModel,
    TypeAdapter,
    field_validator,
    model_validator,
)
import re

from ..utils.geo import Coordinate, convert_degsecmin_coordinate


def convert_point(point: str | Coordinate) -> Coordinate:
    if not isinstance(point, str):
        return point

    lat, ns, lng, we = re.findall(r"(\d+)(N|S)(\d+)(W|E)", point)[0]
    lat *= -1 if ns == "S" else 1
    lng *= -1 if we == "W" else 1
    return cast(
        Coordinate,
        [convert_degsecmin_coordinate(lat), convert_degsecmin_coordinate(lng)],
    )


@dataclass
class EAUPHeader:
    prepared_on: NaiveDatetime
    valid_from: NaiveDatetime
    valid_until: NaiveDatetime


class AreaBooking(BaseModel):
    name: str
    polygon: list[Coordinate]
    lower_limit: int
    upper_limit: int
    start_datetime: AwareDatetime
    end_datetime: AwareDatetime

    @field_validator("polygon", mode="before")
    @classmethod
    def polygon_validator(cls, input: list[str | Coordinate]) -> list[Coordinate]:
        return [convert_point(point) for point in input]

    @field_validator("lower_limit", "upper_limit", mode="before")
    @classmethod
    def limits_validator(cls, input: int | str) -> int:
        if isinstance(input, int):
            return input

        if input in ("GND", "MSL"):
            return 0

        return int(input[1:], 10)

    @field_validator("start_datetime", "end_datetime", mode="before")
    @classmethod
    def force_utc(cls, input: str) -> AwareDatetime:
        return TypeAdapter(datetime).validate_python(input).replace(tzinfo=UTC)


class EAUPAreas(BaseModel):
    header: EAUPHeader
    areas: list[AreaBooking]

    @model_validator(mode="before")
    @classmethod
    def prune_duplicates(cls, data: Any) -> Any:
        if isinstance(data["header"], EAUPHeader):
            return data

        return data | {
            "areas": [
                json.loads(a)
                for a in set(json.dumps(area, sort_keys=True) for area in data["areas"])
            ]
        }
