from dataclasses import dataclass
from typing import Literal


@dataclass
class LoaItem:
    aerodrome: str  # FIXME: should be List[str]
    adep_ades: Literal["ADEP", "ADES"] | None
    cop: str
    level: int
    feet: bool
    xc: str | None
    special_conditions: str
    from_sector: str
    to_sector: str
    from_fir: str
    to_fir: str
