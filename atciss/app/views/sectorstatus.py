import enum
from pydantic import AwareDatetime

from sqlmodel import Column, DateTime, Enum, Field, SQLModel


class Status(str, enum.Enum):
    green = 0
    orange = 1
    red = 2
    purple = 3


class SectorStatus(SQLModel, table=True):
    id: str = Field(primary_key=True, nullable=False)
    status: Status = Field(sa_column=Column(Enum(Status)))
    changed_by_cid: str
    updated_at: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
