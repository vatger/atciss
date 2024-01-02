from datetime import UTC, datetime
from typing import Optional
from geoalchemy2 import Geometry, WKBElement, WKTElement
from pydantic import AwareDatetime, ConfigDict, TypeAdapter, field_serializer, field_validator
from sqlalchemy import Column
from sqlmodel import DateTime, Field, SQLModel
from atciss.app.utils.geo import postgis_polygon_serialize, postgis_polygon_validate


class Sigmet(SQLModel, table=True):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    isigmetId: int = Field(primary_key=True, nullable=False)
    icaoId: str = Field()
    firId: str = Field()
    receiptTime: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    validTimeFrom: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    validTimeTo: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    seriesId: str
    hazard: str
    qualifier: str
    base: Optional[int]
    top: Optional[int]
    geom: str
    dir: Optional[str]
    spd: Optional[int]
    chng: Optional[str]
    coords: WKTElement | WKBElement = Field(sa_column=Column(Geometry("Polygon")))
    rawSigmet: str

    location_validator = field_validator("coords", mode="before")(postgis_polygon_validate)
    location_serializer = field_serializer("coords")(postgis_polygon_serialize)

    @field_validator("receiptTime", mode="before")
    @classmethod
    def force_utc(cls, input: str) -> AwareDatetime:
        return TypeAdapter(datetime).validate_python(input).replace(tzinfo=UTC)
