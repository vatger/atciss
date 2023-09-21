from __future__ import annotations
from typing import List, Optional

from pydantic import AwareDatetime, BaseModel, field_validator


class Controller(BaseModel):
    cid: int
    name: str
    callsign: str
    frequency: str
    facility: int
    rating: int
    server: str
    visual_range: int
    logon_time: AwareDatetime
    last_updated: AwareDatetime
    text_atis: str

    @field_validator("text_atis", mode="before")
    @classmethod
    def atis_validator(cls, v: Optional[List[str]]) -> str:
        if v is None:
            return ""
        return "\n".join(v)
