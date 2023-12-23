from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Annotated, Any, List, Optional, Sequence, Tuple, cast
from pydantic import (
    AwareDatetime,
    BaseModel,
    StringConstraints,
    computed_field,
    field_validator,
)

from metar.Datatypes import distance
from metar.Metar import Metar, CLOUD_TYPE


AirportIcao = Annotated[str, StringConstraints(min_length=4, max_length=4, to_upper=True)]


@dataclass
class RvrModel:
    runway: str
    low: float
    high: Optional[float]
    trend: Optional[str]

    @classmethod
    def from_tuple(
        cls,
        # FIXME should be: Tuple[str, distance, Optional[distance], str]
        parsed: List[Any],
    ) -> RvrModel:
        runway, low, high, _, trend = parsed
        return cls(
            runway=runway,
            low=low.value("M"),
            high=high.value("M") if high is not None else None,
            trend=trend,
        )


@dataclass
class CloudModel:
    cover: str
    height: Optional[float]
    type: Optional[str]
    type_text: Optional[str]

    @classmethod
    def from_tuple(
        cls,
        parsed: Tuple[str, Optional[distance], Optional[str]],
    ) -> CloudModel:
        cover, height, typ = parsed
        return cls(
            cover=cover,
            height=height.value("FT") if height is not None else None,
            type=typ,
            type_text=CLOUD_TYPE.get(typ, None),
        )


class MetarModel(BaseModel):
    """METAR response model."""

    raw: str
    station_id: Optional[str]
    time: AwareDatetime
    automatic: bool
    wind_dir: Optional[float]
    wind_speed: Optional[float]
    wind_gust: Optional[float]
    wind_dir_from: Optional[float]
    wind_dir_to: Optional[float]
    vis: list[float]
    # vis_dir
    # TODO max_vis?
    # max_vis_dir
    temp: Optional[float]
    dewpt: Optional[float]
    qnh: Optional[float]
    rvr: Sequence[RvrModel]
    weather: List[str]
    weather_text: str
    recent_weather: List[str]
    recent_weather_text: str
    clouds: Sequence[CloudModel]
    trend: str

    @field_validator("weather", "recent_weather", mode="before")
    @classmethod
    def weather_validator(cls, v: list[list[Optional[str]]]) -> list[str]:
        return ["".join([ws for ws in w if ws is not None]) for w in v]

    @field_validator("vis", mode="before")
    @classmethod
    def vis_validator(cls, v: list[str] | None) -> list[str]:
        return [] if v is None else v

    @computed_field
    def tl(self) -> Optional[int]:
        if self.qnh is None:
            return None
        if self.qnh < 978:
            return 80
        if self.qnh < 1014:
            return 70
        if self.qnh < 1051:
            return 60
        return 50

    @classmethod
    def from_str(cls, raw_metar: str) -> MetarModel:
        parsed = Metar(raw_metar)
        model = MetarModel.model_validate(
            {
                "station_id": parsed.station_id,
                "raw": raw_metar,
                "time": cast(datetime, parsed.time).replace(tzinfo=UTC),
                "automatic": parsed.mod == "AUTO",
                "wind_dir": parsed.wind_dir.value() if parsed.wind_dir is not None else None,
                "wind_speed": parsed.wind_speed.value("KT")
                if parsed.wind_speed is not None
                else None,
                "wind_gust": parsed.wind_gust.value("KT") if parsed.wind_gust is not None else None,
                "wind_dir_from": parsed.wind_dir_from.value()
                if parsed.wind_dir_from is not None
                else None,
                "wind_dir_to": parsed.wind_dir_to.value()
                if parsed.wind_dir_to is not None
                else None,
                "vis": [
                    min(vis.value("M"), 9999)
                    for vis in (parsed.vis, parsed.max_vis)
                    if vis is not None
                ]
                if parsed.vis is not None
                else None,
                "temp": parsed.temp.value("C") if parsed.temp is not None else None,
                "dewpt": parsed.dewpt.value("C") if parsed.dewpt is not None else None,
                "qnh": parsed.press.value("HPA") if parsed.press is not None else None,
                "rvr": [RvrModel.from_tuple(rvr) for rvr in parsed.runway],
                "weather": parsed.weather,
                "weather_text": parsed.present_weather(),
                "recent_weather": parsed.recent,
                "recent_weather_text": parsed.recent_weather(),
                "clouds": [CloudModel.from_tuple(clouds) for clouds in parsed.sky],
                "trend": parsed.trend(),
            }
        )

        return model
