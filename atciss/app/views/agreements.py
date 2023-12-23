from pydantic import AwareDatetime

from sqlmodel import Column, DateTime, Field, SQLModel


class Agreements(SQLModel, table=True):
    fir: str = Field(primary_key=True, nullable=False)
    text: str
    changed_by_cid: str
    updated_at: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
