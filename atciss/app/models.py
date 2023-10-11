from typing import Any, Optional
import uuid
from geoalchemy2 import Geometry
from sqlmodel import Column, SQLModel, Field

from .views.booking import Booking  # noqa: F401 pylint: disable=unused-import


class UserBase(SQLModel):
    cid: int = Field(default=None, nullable=False, primary_key=True)
    name: str
    rating: str


class User(UserBase, table=True):
    pass


class AerodromeBase(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    name: str = Field(nullable=False)
    type: str = Field(nullable=False)
    local_designator: Optional[str]
    icao_designator: Optional[str]
    iata_designator: Optional[str]
    elevation: Optional[float]
    mag_variation: Optional[float]
    arp_location: Any = Field(sa_column=Column(Geometry("Point")))
    arp_elevation: Optional[float]
    ifr: Optional[bool]

    class Config:
        arbitrary_types_allowed = True


class Aerodrome(AerodromeBase, table=True):
    pass
