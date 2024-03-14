import uuid

from sqlmodel import Field, SQLModel

from .views.booking import Booking  # noqa: F401
from .views.dfs_aixm import (  # noqa: F401
    Aerodrome,
    Navaid,
    Runway,
    RunwayDirection,
)


class UserBase(SQLModel):
    cid: int = Field(default=None, nullable=False, primary_key=True)
    name: str
    rating: str
    rostered: bool = Field(default=False)


class User(UserBase, table=True):
    pass


class AircraftPerformanceData(SQLModel, table=True):
    __tablename__ = "ac_data"  # type: ignore

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, nullable=False)
    manufacturer: str
    model: str
    icao_designator: str | None = None
    iata_designator: str | None = None
    type: str | None = None
    engine_type: str | None = None
    engine_count: int
    fuel_capacity: float | None = None
    service_ceiling: float | None = None
    wingspan: float | None = None
    length: float | None = None
    height: float | None = None
    max_speed_indicated: float | None = None
    max_speed_mach: float | None = None
    max_weight_taxi: float | None = None
    max_weight_takeoff: float | None = None
    max_weight_landing: float | None = None
    max_weight_zerofuel: float | None = None
    v_at: float | None = None
    cruise_tas: float | None = None
    cat_wtc: str | None = None
    cat_recat: str | None = None
    cat_app: str | None = None
    cat_arc: str | None = None
    remarks: str | None = None
