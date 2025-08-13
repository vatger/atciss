import re
from collections.abc import Sequence

from loguru import logger
from pydantic import BaseModel, computed_field

from atciss.app.views.metar import MetarModel


def concatSep(lst: Sequence[str | None], sep: str = " ") -> str:
    return sep.join(e for e in lst if e is not None)


def avail(o: float | None, f: str = "{}") -> str:
    return f.format(int(o)) if o is not None else "UNAVAILABLE"


def verbalizeWeather(weather: Sequence) -> str | None:
    return concatSep([verbalizeWeatherItem(w) for w in weather])


def verbalizeWeatherItem(wxr: tuple[str, str, str, str | None, str | None]) -> str | None:
    vicinity = "VC" in wxr[0]
    intensity = "heavy" if "+" in wxr[0] else "light" if "-" in wxr[0] else None
    precip = concatSep(
        [WEATHER_PREC.get(p) for p in [wxr[2][i : i + 2] for i in range(0, len(wxr[2]), 2)]],
        " and ",
    )
    if precip == "":
        precip = None

    logger.info("precip is '{}'", precip)

    obsc = WEATHER_OBSC.get(wxr[3] or "")
    logger.info("obsc is '{}'", obsc)
    oth = WEATHER_OTHER.get(wxr[4] or "")
    logger.info("oth is '{}'", oth)

    bits = [
        WEATHER_DESC.get(wxr[1]),
        WEATHER_DESC_PREP.get(wxr[1]) if (precip or obsc or oth) else None,
        intensity,
        precip,
        obsc,
        oth,
    ]
    wxr_str = concatSep(bits).strip()

    if vicinity:
        wxr_str += " in the vicinity"

    logger.info("WXR is '{}'", wxr_str)
    if wxr_str == "":
        return None

    return wxr_str.upper()


class VerbalizedMetarModel(BaseModel):
    _metar: MetarModel

    def __init__(self, metar: MetarModel):
        super().__init__()
        self._metar = metar

    @computed_field
    def time(self) -> str | None:
        return self._metar.time.strftime("%H%M")

    @computed_field
    @property
    def wind(self) -> str:
        return (
            "CALM"
            if self._metar.wind_speed is None or self._metar.wind_speed == 0
            else concatSep([
                f"{int(self._metar.wind_dir):03} DEGREES"
                if self._metar.wind_dir is not None
                else "VARIABLE",
                f"{int(self._metar.wind_speed)} KT"
                + ("S" if int(self._metar.wind_speed) > 1 else ""),
                f"GUSTING MAX {int(self._metar.wind_gust)} KTS"
                if self._metar.wind_gust is not None
                else None,
                (
                    f"VARIABLE BETWEEN {int(self._metar.wind_dir_from):03} "
                    f"AND {int(self._metar.wind_dir_to):03} DEGREES"
                )
                if self._metar.wind_dir_from is not None and self._metar.wind_dir_to is not None
                else None,
            ])
        )

    @computed_field
    @property
    def visibility(self) -> str:
        def formatvis(rng: float):
            return f"{int((rng + 1) / 1000)} KILOMETERS" if rng >= 5000 else f"{int(rng)} METERS"

        return (
            "UNAVAILABLE"
            if len(self._metar.vis) == 0
            else concatSep([
                formatvis(self._metar.vis[0]),
                f"MINIMUM {formatvis(self._metar.vis[1])}" if len(self._metar.vis) > 1 else None,
            ])
        )

    @computed_field
    @property
    def rvr(self) -> str | None:
        trends = {
            "U": "UPGRADING",
            "D": "DOWNGRADING",
            "N": "NEUTRAL",
            None: "",
        }

        return (
            (
                "RVR "
                + " ".join(
                    concatSep([f"RUNWAY {r.runway} {int(r.low)} METERS", trends.get(r.trend)])
                    for r in self._metar.rvr
                )
            )
            if len(self._metar.rvr) > 0
            else None
        )

    @computed_field
    @property
    def clouds(self) -> str:
        def coverToStr(cover: str) -> str:
            return {
                "SCT": "SCATTERED",
                "FEW": "FEW",
                "BKN": "BROKEN",
                "OVC": "OVERCAST",
                "NCD": "NOT DETECTED",
            }.get(cover, "UNKNOWN")

        return (
            "CAVOK"
            if len(self._metar.clouds) == 0
            else "NO SIGNIFICANT CLOUDS"
            if len(self._metar.clouds) == 1 and self._metar.clouds[0].cover == "NSC"
            else "CLOUDS "
            + (
                concatSep([
                    concatSep([
                        coverToStr(cloudlayer.cover),
                        cloudlayer.type_text.upper() if cloudlayer.type_text is not None else None,
                        f"{int(cloudlayer.height)} FEET" if cloudlayer.height is not None else None,
                    ])
                    for cloudlayer in self._metar.clouds
                ])
            )
        )

    @computed_field
    @property
    def qnh(self) -> str:
        return avail(self._metar.qnh, "{} HPA")

    @computed_field
    @property
    def qnh_and_altimeter(self) -> str:
        if self._metar.qnh is None:
            return "UNAVAILABLE"
        else:
            inhg = f"{self._metar.qnh * 0.02952998057228486:.2f}".replace(".", "")
            return f"{int(self._metar.qnh)} HPA OR {inhg} INCHES"

    @computed_field
    @property
    def temp(self) -> str:
        return avail(self._metar.temp, "{}")

    @computed_field
    @property
    def dewpt(self) -> str:
        return avail(self._metar.dewpt, "{}")

    @computed_field
    @property
    def weather(self) -> str | None:
        return verbalizeWeather(self._metar.weather_bits)

    @computed_field
    @property
    def recent(self) -> str | None:
        return verbalizeWeather(self._metar.recent_weather_bits)

    @computed_field
    @property
    def trend(self) -> str | None:
        if self._metar.trend == "":
            return None
        if self._metar.trend == "NOSIG":
            return "NOSIG"

        trend_part = TREND_RE.search(self._metar.raw)
        if not trend_part:
            return None

        groups = trend_part.groupdict()
        logger.info(groups)
        # HACK: This should be replaced with proper parsing in the first run
        hack_metar = f"ZZZZ 010101Z {groups['code']}"
        trend_metar = VerbalizedMetarModel(MetarModel.from_str(hack_metar))
        return concatSep([
            TREND_TYPES.get(groups["trend"]),
            f"VISIBILITY {trend_metar.visibility}"
            if trend_metar.visibility != "UNAVAILABLE"
            else None,
            f"WIND {trend_metar.wind}" if trend_metar.wind and trend_metar.wind != "CALM" else None,
            trend_metar.weather or None,
            trend_metar.clouds if trend_metar.clouds and trend_metar.clouds != "CAVOK" else None,
        ]).upper()


WEATHER_DESC = {
    "BC": "patches",
    "BL": "blowing",
    "SH": "showers",
    "TS": "thunderstorm",
    "FZ": "freezing",
}
WEATHER_DESC_PREP = {
    "BC": "of",
    "BL": None,
    "SH": "of",
    "TS": "with",
    "FZ": None,
}
WEATHER_PREC = {
    "DZ": "drizzle",
    "RA": "rain",
    "SN": "snow",
    "IC": "ice crystals",
    "PL": "ice pellets",
    "GR": "hail",
    "GS": "snow pellets",
    "UP": "unknown precipitation",
    "//": None,
}
WEATHER_OBSC = {
    "BR": "mist",
    "FG": "fog",
    "FU": "smoke",
    "DU": "dust",
    "SA": "sand",
    "HZ": "haze",
    "PY": "spray",
}
WEATHER_OTHER = {
    "SQ": "squalls",
    "FC": "funnel cloud",
    "SS": "sandstorm",
    "NSW": "no significant weather",
}
TREND_TYPES = {
    "BECMG": "becoming",
    "TEMPO": "temporary",
    "FCST": "forecast",
    "NOSIG": "NOSIG",
}
TREND_RE = re.compile(r"(?P<trend>TEMPO|BECMG|FCST)\s+(?P<code>.*)")
TRENDTIME_RE = re.compile(r"(?P<when>(FM|TL|AT))(?P<hour>\d\d)(?P<min>\d\d)\s+")


# Filters
def autohandoff(value: str, callsign: str | None) -> str:
    if value in ["122.800", "122.80", "122.8"]:
        return "MONITOR ADVISORY 122.800"
    else:
        return f"CONTACT {callsign + ' ' if callsign else ''}{value}"
