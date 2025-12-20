from __future__ import annotations

from pydantic import AwareDatetime, BaseModel, ConfigDict
from pynotam import Notam
from sqlmodel import Column, DateTime, Field, SQLModel


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class NotamSeen(SQLModel, table=True):
    notam_id: str = Field(primary_key=True, nullable=False)
    cid: str = Field(primary_key=True, nullable=False)
    seen_at: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))


class SourceNotamPoint(BaseModel):
    type: str
    coordinates: list[float]


class SourceNotamReferral(BaseModel):
    series: str
    number: int
    year: int


class SourceNotam(BaseModel):
    id: str
    series: str
    type: str
    canceled: bool
    issued: AwareDatetime
    superseded_by: str | None
    number: int
    year: int
    fir: str
    selection_code: str | None
    scope: str
    traffic: str
    purpose: str
    fl_min: int
    fl_max: int
    effective_start: AwareDatetime
    effective_end: AwareDatetime | None
    effective_end_perm: bool
    effective_end_est: bool
    locations: list[str]
    schedule: str | None
    text: str
    aftn_account: str
    source: str | None
    airport_name: str | None
    icao_translation: str
    referred_notam: SourceNotamReferral | None
    coord: SourceNotamPoint | None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class NotamModel(BaseModel):
    full_text: str
    notam_id: str
    notam_type: str
    ref_notam_id: str | None
    fir: str
    notam_code: str
    traffic_type: set[str]
    purpose: set[str]
    scope: set[str]
    fl_lower: int
    fl_upper: int
    area: dict[str, str | int]
    location: list[str]
    valid_from: AwareDatetime
    valid_till: AwareDatetime
    schedule: str | None
    body: str
    limit_lower: str | None
    limit_upper: str | None
    source: str | None
    created: AwareDatetime | None

    @classmethod
    def from_str(cls, raw: str) -> NotamModel:
        notam = Notam.from_str(raw)
        return cls(
            full_text=notam.full_text,
            notam_id=notam.notam_id,
            notam_type=notam.notam_type,
            ref_notam_id=notam.ref_notam_id,
            fir=notam.fir,
            notam_code=notam.notam_code,
            traffic_type=notam.traffic_type,
            purpose=notam.purpose,
            scope=notam.scope,
            fl_lower=notam.fl_lower,
            fl_upper=notam.fl_upper,
            area=notam.area,
            location=notam.location,
            valid_from=notam.valid_from,
            valid_till=notam.valid_till,
            schedule=notam.schedule,
            body=notam.body,
            limit_lower=notam.limit_lower,
            limit_upper=notam.limit_upper,
            source=notam.source,
            created=notam.created,
        )

        # The following contain [start,end) indices for their corresponding
        # NOTAM items (if such exist).
        # They can be used to index into Notam.full_text.
        # indices_item_a: Optional[Tuple[int, int]] = None
        # indices_item_b: Optional[Tuple[int, int]] = None
        # indices_item_c: Optional[Tuple[int, int]] = None
        # indices_item_d: Optional[Tuple[int, int]] = None
        # indices_item_e: Optional[Tuple[int, int]] = None
        # indices_item_f: Optional[Tuple[int, int]] = None
        # indices_item_g: Optional[Tuple[int, int]] = None
