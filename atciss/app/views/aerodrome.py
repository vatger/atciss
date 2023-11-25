from typing import TYPE_CHECKING, Any, Optional
import uuid
from geoalchemy2 import Geometry

from sqlmodel import Column, Field, Relationship, SQLModel


if TYPE_CHECKING:
    from atciss.app.views.runway import Runway


class Aerodrome(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    name: Optional[str] = None
    type: str = Field(nullable=False)
    local_designator: Optional[str] = None
    icao_designator: Optional[str] = None
    iata_designator: Optional[str] = None
    elevation: Optional[float] = None
    mag_variation: Optional[float] = None
    arp_location: Any = Field(sa_column=Column(Geometry("Point")))
    arp_elevation: Optional[float] = None
    ifr: Optional[bool] = None

    runways: list["Runway"] = Relationship(back_populates="aerodrome")
