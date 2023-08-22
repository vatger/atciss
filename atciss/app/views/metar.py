from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional, Sequence, Tuple, cast

from metar.Datatypes import distance
from metar.Metar import Metar
from pydantic import BaseModel, AwareDatetime, field_validator


@dataclass
class RvrModel:
    # TODO upstream does not parse trend
    runway: str
    low: float
    high: Optional[float]

    @classmethod
    def from_tuple(
        cls, parsed: Tuple[str, distance, Optional[distance], str]
    ) -> RvrModel:
        runway, low, high, _ = parsed
        return cls(
            runway=runway,
            low=low.value("M"),
            high=high.value("M") if high is not None else None,
        )


@dataclass
class CloudModel:
    cover: str
    height: Optional[float]
    type: Optional[str]

    @classmethod
    def from_tuple(
        cls, parsed: Tuple[str, Optional[distance], Optional[str]]
    ) -> CloudModel:
        cover, height, type = parsed
        return cls(
            cover=cover,
            height=height.value("FT") if height is not None else None,
            type=type,
        )


class MetarModel(BaseModel):
    """METAR response model."""

    raw: str
    station_id: str
    time: AwareDatetime
    wind_dir: Optional[float]
    wind_speed: float
    wind_gust: Optional[float]
    wind_dir_from: Optional[float]
    wind_dir_to: Optional[float]
    vis: float
    # vis_dir
    # TODO max_vis?
    # max_vis_dir
    temp: float
    dewpt: float
    qnh: float
    rvr: Sequence[RvrModel]
    weather: List[str]
    recent_weather: List[str]
    clouds: Sequence[CloudModel]
    trend: str

    @field_validator("weather", "recent_weather", mode="before")
    @classmethod
    def weather_validator(cls, v: List[List[Optional[str]]]) -> List[str]:
        return ["".join([ws for ws in w if ws is not None]) for w in v]

    @classmethod
    def from_str(cls, raw_metar: str) -> MetarModel:
        parsed = Metar(raw_metar)
        model = cls(
            station_id=parsed.station_id,
            raw=raw_metar,
            time=cast(datetime, parsed.time).replace(tzinfo=timezone.utc),
            wind_dir=parsed.wind_dir.value() if parsed.wind_dir is not None else None,
            wind_speed=parsed.wind_speed.value("KT"),
            wind_gust=parsed.wind_gust.value("KT")
            if parsed.wind_gust is not None
            else None,
            wind_dir_from=parsed.wind_dir_from.value()
            if parsed.wind_dir_from is not None
            else None,
            wind_dir_to=parsed.wind_dir_to.value()
            if parsed.wind_dir_to is not None
            else None,
            vis=min(parsed.vis.value("M"), 9999),
            temp=parsed.temp.value("C"),
            dewpt=parsed.dewpt.value("C"),
            qnh=parsed.press.value("HPA"),
            rvr=[RvrModel.from_tuple(rvr) for rvr in parsed.runway],
            weather=parsed.weather,
            recent_weather=parsed.recent,
            clouds=[CloudModel.from_tuple(clouds) for clouds in parsed.sky],
            trend=parsed.trend(),
        )

        return model
