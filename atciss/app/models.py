from typing import Optional
import uuid
from sqlmodel import SQLModel, Field

from .views.aerodrome import Aerodrome  # noqa: F401 pylint: disable=unused-import
from .views.booking import Booking  # noqa: F401 pylint: disable=unused-import
from .views.navaid import Navaid  # noqa: F401 pylint: disable=unused-import
from .views.runway import Runway, RunwayDirection  # noqa: F401 pylint: disable=unused-import


class UserBase(SQLModel):
    cid: int = Field(default=None, nullable=False, primary_key=True)
    name: str
    rating: str


class User(UserBase, table=True):
    pass


class AircraftPerformanceData(SQLModel, table=True):
    __tablename__ = "ac_data"  # type: ignore

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    manufacturer: str
    model: str
    icao_designator: Optional[str]
    iata_designator: Optional[str]
    type: Optional[str]
    engine_type: Optional[str]
    engine_count: int
    fuel_capacity: Optional[float]
    service_ceiling: Optional[float]
    wingspan: Optional[float]
    length: Optional[float]
    height: Optional[float]
    max_speed_indicated: Optional[float]
    max_speed_mach: Optional[float]
    max_weight_taxi: Optional[float]
    max_weight_takeoff: Optional[float]
    max_weight_landing: Optional[float]
    max_weight_zerofuel: Optional[float]
    v_at: Optional[float]
    cruise_tas: Optional[float]
    cat_wtc: Optional[str]
    cat_recat: Optional[str]
    cat_app: Optional[str]
    cat_arc: Optional[str]
    remarks: Optional[str]
