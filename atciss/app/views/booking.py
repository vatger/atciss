from datetime import datetime, timezone
from pydantic import AwareDatetime, TypeAdapter, field_validator
from sqlalchemy import Column, DateTime

from sqlmodel import Field, SQLModel


class Booking(SQLModel, table=True):
    id: int = Field(int, primary_key=True)
    cid: int
    type: str
    callsign: str
    start: AwareDatetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    end: AwareDatetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    division: str
    subdivision: str | None

    @field_validator("start", "end", mode="before")
    @classmethod
    def force_utc(cls, input: str) -> AwareDatetime:
        return TypeAdapter(datetime).validate_python(input).replace(tzinfo=timezone.utc)
