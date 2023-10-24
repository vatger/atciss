from typing import Any, Optional
import uuid
from geoalchemy2 import Geometry, WKBElement
from geoalchemy2.shape import to_shape
from pydantic import SerializationInfo, field_serializer
from shapely import Point
from sqlmodel import Column, Relationship, SQLModel, Field

from .views.booking import Booking  # noqa: F401 pylint: disable=unused-import


class UserBase(SQLModel):
    cid: int = Field(default=None, nullable=False, primary_key=True)
    name: str
    rating: str


class User(UserBase, table=True):
    pass


class Aerodrome(SQLModel, table=True):
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

    runways: list["Runway"] = Relationship(back_populates="aerodrome")

    class Config:
        arbitrary_types_allowed = True


class Runway(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    aerodrome_id: uuid.UUID = Field(nullable=False, foreign_key="aerodrome.id")
    designator: str = Field(nullable=False)
    length: Optional[float]
    width: Optional[float]
    surface: Optional[str]

    aerodrome: Aerodrome = Relationship(back_populates="runways")

    class Config:
        arbitrary_types_allowed = True


class RunwayDirection(SQLModel, table=True):
    __tablename__ = "runway_direction"  # type: ignore

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    runway_id: uuid.UUID = Field(nullable=False, foreign_key="runway.id")
    designator: str = Field(nullable=False)
    true_bearing: Optional[float]
    magnetic_bearing: Optional[float]
    guidance: Optional[str]

    runway: Runway = Relationship()


class Navaid(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    designator: str = Field(nullable=False)
    name: str = Field(nullable=False)
    type: str = Field(nullable=False)
    location: Any = Field(sa_column=Column(Geometry("Point")))
    channel: Optional[str]
    frequency: Optional[float]
    aerodrome_id: Optional[uuid.UUID] = Field(nullable=True, foreign_key="aerodrome.id")
    runway_direction_id: Optional[uuid.UUID] = Field(
        nullable=True, foreign_key="runway_direction.id"
    )
    remark: Optional[str]
    operation_remark: Optional[str]

    aerodrome: Optional[Aerodrome] = Relationship()
    runway_direction: Optional[RunwayDirection] = Relationship()

    @field_serializer("location")
    def serialize_location(self, loc: WKBElement, _info: SerializationInfo) -> tuple[float, float]:
        point: Point = to_shape(loc)

        return (point.y, point.x)
