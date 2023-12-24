from __future__ import annotations

from typing import Dict, List, Optional, Set

from pydantic import AwareDatetime, BaseModel

from pynotam import Notam
from sqlmodel import Column, DateTime, Field, SQLModel


class NotamSeen(SQLModel, table=True):
    notam_id: str = Field(primary_key=True, nullable=False)
    cid: str = Field(primary_key=True, nullable=False)
    seen_at: AwareDatetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))


class NotamModel(BaseModel):
    full_text: str
    notam_id: str
    notam_type: str
    ref_notam_id: Optional[str]
    fir: str
    notam_code: str
    traffic_type: Set[str]
    purpose: Set[str]
    scope: Set[str]
    fl_lower: int
    fl_upper: int
    area: Dict[str, str | int]
    location: List[str]
    valid_from: AwareDatetime
    valid_till: AwareDatetime
    schedule: Optional[str]
    body: str
    limit_lower: Optional[str]
    limit_upper: Optional[str]
    source: Optional[str]
    created: Optional[AwareDatetime]

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
