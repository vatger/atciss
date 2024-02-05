import uuid
from typing import TYPE_CHECKING

from astral import Observer
from astral.sun import sunrise, sunset
from geoalchemy2 import WKBElement, WKTElement
from geoalchemy2.shape import to_shape
from geoalchemy2.types import Geometry
from pydantic import AwareDatetime, ConfigDict, computed_field, field_serializer, field_validator
from sqlalchemy.orm import registry
from sqlmodel import Column, Field, Relationship, SQLModel

from atciss.app.utils.geo import postgis_coordinate_serialize, postgis_coordinate_validate

if TYPE_CHECKING:
    from shapely import Point

mapper_registry = registry()


class AerodromeBase(SQLModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    name: str | None = None
    type: str = Field(nullable=False)
    local_designator: str | None = None
    icao_designator: str | None = None
    iata_designator: str | None = None
    elevation: float | None = None
    mag_variation: float | None = None
    arp_location: WKTElement | WKBElement = Field(sa_column=Column(Geometry("Point")))
    arp_elevation: float | None = None
    ifr: bool | None = None
    source: str

    location_validator = field_validator("arp_location", mode="before")(postgis_coordinate_validate)
    location_serializer = field_serializer("arp_location")(postgis_coordinate_serialize)

    @computed_field  # type: ignore[misc]
    @property
    def sunrise(self) -> AwareDatetime:
        point: Point = to_shape(self.arp_location)

        # elevation in Observer is prominece not elevation above MSL
        return sunrise(Observer(point.y, point.x, 0))

    @computed_field  # type: ignore[misc]
    @property
    def sunset(self) -> AwareDatetime:
        point: Point = to_shape(self.arp_location)

        # elevation in Observer is prominece not elevation above MSL
        return sunset(Observer(point.y, point.x, 0))


class Aerodrome(AerodromeBase, table=True):
    __allow_unmapped__ = True
    runways: list["Runway"] = Relationship(
        back_populates="aerodrome",
        sa_relationship_kwargs={"lazy": "subquery"},
    )


class AerodromeWithRunways(AerodromeBase):
    runways: list["RunwayWithDirections"]


class RunwayBase(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    aerodrome_id: uuid.UUID = Field(nullable=False, foreign_key="aerodrome.id")
    designator: str = Field(nullable=False)
    length: float | None
    width: float | None
    surface: str | None


class Runway(RunwayBase, table=True):
    aerodrome: Aerodrome = Relationship(back_populates="runways")
    directions: list["RunwayDirection"] = Relationship(
        back_populates="runway",
        sa_relationship_kwargs={"lazy": "subquery"},
    )


class RunwayWithDirections(RunwayBase):
    directions: list["RunwayDirection"]


class RunwayDirectionBase(SQLModel):
    __tablename__ = "runway_direction"  # type: ignore

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    runway_id: uuid.UUID = Field(nullable=False, foreign_key="runway.id")
    designator: str = Field(nullable=False)
    true_bearing: float | None
    magnetic_bearing: float | None
    guidance: str | None


class RunwayDirection(RunwayDirectionBase, table=True):
    runway: Runway = Relationship(back_populates="directions")


class NavaidBase(SQLModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    designator: str = Field(nullable=False)
    type: str = Field(nullable=False)
    location: WKTElement | WKBElement = Field(sa_column=Column(Geometry("Point")))
    channel: str | None = None
    frequency: float | None = None
    aerodrome_id: uuid.UUID | None = Field(nullable=True, default=None, foreign_key="aerodrome.id")
    runway_direction_id: uuid.UUID | None = Field(
        nullable=True,
        default=None,
        foreign_key="runway_direction.id",
    )
    remark: str | None = None
    operation_remark: str | None = None
    name: str | None = None
    source: str

    location_validator = field_validator("location", mode="before")(postgis_coordinate_validate)
    location_serializer = field_serializer("location")(postgis_coordinate_serialize)


class Navaid(NavaidBase, table=True):
    aerodrome: Aerodrome | None = Relationship()
    runway_direction: RunwayDirection | None = Relationship()


_ = AerodromeWithRunways.model_rebuild()
