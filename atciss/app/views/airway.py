from typing import Optional
import uuid
from geoalchemy2 import Geometry, WKBElement, WKTElement
from pydantic import ConfigDict, field_serializer, field_validator
from sqlalchemy import Column
from sqlmodel import Field, Relationship, SQLModel
from atciss.app.utils.geo import postgis_line_serialize, postgis_line_validate

from atciss.app.views.navaid import Navaid


class Airway(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    designatorPrefix: Optional[str]
    designatorSecondLetter: Optional[str]
    designatorNumber: Optional[str]
    locationDesignator: Optional[str]

    segments: list["AirwaySegment"] = Relationship(back_populates="airway")


class AirwaySegmentBase(SQLModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    level: str
    true_track: Optional[float]
    reverse_true_track: Optional[float]
    length: float
    upper_limit: int
    upper_limit_uom: str
    lower_limit: int
    lower_limit_uom: str
    start_id: uuid.UUID = Field(nullable=False, foreign_key="navaid.id")
    end_id: uuid.UUID = Field(nullable=False, foreign_key="navaid.id")
    airway_id: uuid.UUID = Field(nullable=False, foreign_key="airway.id")
    curve_extent: WKTElement | WKBElement = Field(sa_column=Column(Geometry("Linestring")))

    location_validator = field_validator("curve_extent", mode="before")(postgis_line_validate)
    location_serializer = field_serializer("curve_extent")(postgis_line_serialize)


class AirwaySegment(AirwaySegmentBase, table=True):
    start: Navaid = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[AirwaySegment.start_id]"}
    )
    end: Navaid = Relationship(sa_relationship_kwargs={"foreign_keys": "[AirwaySegment.end_id]"})
    airway: Airway = Relationship(back_populates="segments")


class AirwaySegmentWithRefs(AirwaySegmentBase):
    start: Navaid
    end: Navaid
    airway: Airway
