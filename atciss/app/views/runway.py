from typing import TYPE_CHECKING, Optional
import uuid
from sqlmodel import Field, Relationship, SQLModel


if TYPE_CHECKING:
    from atciss.app.views.aerodrome import Aerodrome


class Runway(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    aerodrome_id: uuid.UUID = Field(nullable=False, foreign_key="aerodrome.id")
    designator: str = Field(nullable=False)
    length: Optional[float]
    width: Optional[float]
    surface: Optional[str]

    aerodrome: "Aerodrome" = Relationship(back_populates="runways")


class RunwayDirection(SQLModel, table=True):
    __tablename__ = "runway_direction"  # type: ignore

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    runway_id: uuid.UUID = Field(nullable=False, foreign_key="runway.id")
    designator: str = Field(nullable=False)
    true_bearing: Optional[float]
    magnetic_bearing: Optional[float]
    guidance: Optional[str]

    runway: Runway = Relationship()
