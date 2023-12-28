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
    icao_designator: Optional[str] = None
    iata_designator: Optional[str] = None
    type: Optional[str] = None
    engine_type: Optional[str] = None
    engine_count: int
    fuel_capacity: Optional[float] = None
    service_ceiling: Optional[float] = None
    wingspan: Optional[float] = None
    length: Optional[float] = None
    height: Optional[float] = None
    max_speed_indicated: Optional[float] = None
    max_speed_mach: Optional[float] = None
    max_weight_taxi: Optional[float] = None
    max_weight_takeoff: Optional[float] = None
    max_weight_landing: Optional[float] = None
    max_weight_zerofuel: Optional[float] = None
    v_at: Optional[float] = None
    cruise_tas: Optional[float] = None
    cat_wtc: Optional[str] = None
    cat_recat: Optional[str] = None
    cat_app: Optional[str] = None
    cat_arc: Optional[str] = None
    remarks: Optional[str] = None
