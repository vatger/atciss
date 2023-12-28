from typing import Optional
import uuid
from astral import Observer
from astral.sun import sunrise, sunset
from geoalchemy2 import WKBElement, WKTElement
from geoalchemy2.types import Geometry
from geoalchemy2.shape import to_shape
from pydantic import AwareDatetime, ConfigDict, computed_field, field_serializer, field_validator
from shapely import Point

from sqlmodel import Column, Field, Relationship, SQLModel

from atciss.app.utils.geo import postgis_coordinate_serialize, postgis_coordinate_validate
from atciss.app.views.runway import Runway


class Aerodrome(SQLModel, table=True):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    name: Optional[str] = None
    type: str = Field(nullable=False)
    local_designator: Optional[str] = None
    icao_designator: Optional[str] = None
    iata_designator: Optional[str] = None
    elevation: Optional[float] = None
    mag_variation: Optional[float] = None
    arp_location: WKTElement | WKBElement = Field(sa_column=Column(Geometry("Point")))
    arp_elevation: Optional[float] = None
    ifr: Optional[bool] = None
    source: str

    runways: list[Runway] = Relationship(back_populates="aerodrome")

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
