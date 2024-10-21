from datetime import UTC, datetime

from pydantic import AwareDatetime, ConfigDict, TypeAdapter, field_validator
from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class ValidatingSQLModel(SQLModel):
    model_config = ConfigDict(validate_assignment=True)


class Booking(ValidatingSQLModel, table=True):
    id: int = Field(int, primary_key=True)
    cid: str
    callsign: str
    start: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    end: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    type: str = "booking"
    division: str | None = None
    subdivision: str | None = None

    @field_validator("start", "end", mode="before")
    @classmethod
    def force_utc(cls, inp: str) -> AwareDatetime:
        return TypeAdapter(datetime).validate_python(inp).replace(tzinfo=UTC)
