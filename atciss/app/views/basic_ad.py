from typing import Optional

from pydantic import BaseModel


class BasicAD(BaseModel):
    icao: str
    iata: Optional[str]
    name: str
    city: str
    state: str
    country: str
    elevation: int
    lat: float
    lon: float
    tz: str
