from __future__ import annotations

import re
from typing import Any, List, Optional

from loguru import logger
from pydantic import AwareDatetime, BaseModel, field_validator, model_validator


class Atis(BaseModel):
    cid: int
    name: str
    callsign: str
    frequency: str
    facility: int
    rating: int
    server: str
    visual_range: int
    atis_code: Optional[str]
    logon_time: AwareDatetime
    last_updated: AwareDatetime
    text_atis: str
    runways_in_use: List[str]

    @field_validator("callsign", mode="before")
    @classmethod
    def callsign_validator(cls, v: str) -> str:
        return v.removesuffix("_ATIS")

    @model_validator(mode="before")
    @classmethod
    def atis_validator(cls, data: Any) -> Any:
        if isinstance(data, dict):
            text_atis = data.get("text_atis", [])
            try:
                data["text_atis"] = (
                    text_atis
                    if isinstance(text_atis, str)
                    else "\n".join(text_atis or "")
                )
            except Exception as e:
                logger.error(f"{e}, {data}")

            matches = re.search(
                r"RUNWAYS? IN USE ([0-9]{2}[A-Z]?)(?: AND ([0-9]{2}[A-Z]?))?",
                data["text_atis"],
            )
            data["runways_in_use"] = (
                []
                if matches is None
                else [r for r in matches.groups() if r is not None]
            )

        return data
