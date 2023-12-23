from datetime import UTC, datetime
from pydantic import AwareDatetime, TypeAdapter, field_validator
from pydantic_xml import BaseXmlModel, element
from pydantic_xml.element.element import SearchMode
from sqlalchemy import Column, DateTime

from sqlmodel import Field, SQLModel


class Booking(SQLModel, table=True):
    id: int = Field(int, primary_key=True)
    cid: int
    callsign: str
    start: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    end: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    type: str = "event"
    division: str | None = None
    subdivision: str | None = None

    @field_validator("start", "end", mode="before")
    @classmethod
    def force_utc(cls, input: str) -> AwareDatetime:
        return TypeAdapter(datetime).validate_python(input).replace(tzinfo=UTC)


class VatbookBooking(BaseXmlModel, tag="booking", search_mode=SearchMode.UNORDERED):
    id: int = element()
    cid: int = element()
    callsign: str = element()
    start: datetime = element(tag="time_start")
    end: datetime = element(tag="time_end")


class Atcs(BaseXmlModel):
    bookings: list[VatbookBooking] = element(tag="booking")


class VatbookData(BaseXmlModel, tag="bookings", search_mode=SearchMode.UNORDERED):
    timestamp: str = element()
    atcs: Atcs = element()
