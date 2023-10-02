from datetime import datetime

from sqlmodel import Field, SQLModel


class Booking(SQLModel, table=True):
    id: int = Field(int, primary_key=True)
    cid: int
    type: str
    callsign: str
    start: datetime
    end: datetime
    division: str
    subdivision: str | None
