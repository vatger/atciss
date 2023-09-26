from dataclasses import dataclass
from pydantic import NaiveDatetime, BaseModel


@dataclass
class EAUPHeader:
    prepared_on: NaiveDatetime
    valid_from: NaiveDatetime
    valid_until: NaiveDatetime


class AreaBooking(BaseModel):
    name: str
    polygon: list[str]
    lower_limit: str
    upper_limit: str
    start_datetime: NaiveDatetime
    end_datetime: NaiveDatetime


class EAUPAreas(BaseModel):
    header: EAUPHeader
    areas: list[AreaBooking]
