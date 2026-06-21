from datetime import UTC, datetime
from typing import Any

from geoalchemy2 import Geometry, WKBElement, WKTElement
from pydantic import (
    AwareDatetime,
    ConfigDict,
    TypeAdapter,
    field_serializer,
    field_validator,
    model_validator,
)
from sqlalchemy import Column
from sqlmodel import DateTime, Field, SQLModel

from atciss.app.utils.geo import (
    postgis_geometry_serialize,
    postgis_line_validate,
    postgis_multipolygon_validate,
    postgis_polygon_validate,
)


class Sigmet(SQLModel, table=True):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    isigmetId: str = Field(primary_key=True, nullable=False)
    icaoId: str = Field()
    firId: str = Field()
    receiptTime: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    validTimeFrom: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    validTimeTo: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    seriesId: str
    hazard: str
    qualifier: str
    base: int | None
    top: int | None
    geom: str
    dir: str | None
    spd: int | None
    chng: str | None
    coords: WKTElement | WKBElement = Field(sa_column=Column(Geometry()))
    rawSigmet: str

    location_serializer = field_serializer("coords")(postgis_geometry_serialize)

    @model_validator(mode="before")
    @classmethod
    def normalize_input(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data

        if "isigmetId" not in data:
            if "firId" not in data or "seriesId" not in data:
                msg = "SIGMET missing firId/seriesId"
                raise ValueError(msg)
            data = {**data, "isigmetId": f"{data['firId']}-{data['seriesId']}"}

        geom = data.get("geom")
        coords = data.get("coords")
        if coords is None:
            msg = "SIGMET missing coords"
            raise ValueError(msg)
        if geom == "AREA":
            coords = postgis_polygon_validate(coords)
        elif geom == "LINE":
            coords = postgis_line_validate(coords)
        elif geom == "AREAS":
            coords = postgis_multipolygon_validate(coords)
        else:
            msg = f"Unsupported SIGMET geom type: {geom!r}"
            raise ValueError(msg)

        return {**data, "coords": coords}

    @field_validator("receiptTime", mode="before")
    @classmethod
    def force_utc(cls, inp: str) -> AwareDatetime:
        return TypeAdapter(datetime).validate_python(inp).replace(tzinfo=UTC)

    @field_validator("spd", mode="before")
    @classmethod
    def unknown_spd_to_none(cls, inp: str | int | None) -> str | int | None:
        return None if inp == "UNK" else inp
