from pydantic import BaseModel


class BasicAD(BaseModel):
    icao: str
    iata: str | None
    name: str
    city: str
    state: str
    country: str
    elevation: int
    lat: float
    lon: float
    tz: str
