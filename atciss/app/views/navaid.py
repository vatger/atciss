from typing import Optional
import uuid
from geoalchemy2 import Geometry, WKBElement, WKTElement
from pydantic import ConfigDict, field_serializer, field_validator
from sqlmodel import Column, Field, Relationship, SQLModel

from atciss.app.utils.geo import postgis_coordinate_serialize, postgis_coordinate_validate
from atciss.app.views.aerodrome import Aerodrome
from atciss.app.views.runway import RunwayDirection


class Navaid(SQLModel, table=True):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    designator: str = Field(nullable=False)
    type: str = Field(nullable=False)
    location: WKTElement | WKBElement = Field(sa_column=Column(Geometry("Point")))
    channel: Optional[str] = None
    frequency: Optional[float] = None
    aerodrome_id: Optional[uuid.UUID] = Field(
        nullable=True, default=None, foreign_key="aerodrome.id"
    )
    runway_direction_id: Optional[uuid.UUID] = Field(
        nullable=True, default=None, foreign_key="runway_direction.id"
    )
    remark: Optional[str] = None
    operation_remark: Optional[str] = None
    name: Optional[str] = None
    source: str

    aerodrome: Optional[Aerodrome] = Relationship()
    runway_direction: Optional["RunwayDirection"] = Relationship()

    location_validator = field_validator("location", mode="before")(postgis_coordinate_validate)
    location_serializer = field_serializer("location")(postgis_coordinate_serialize)
