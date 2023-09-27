"""Application controllers - metar."""

from typing import Annotated, Dict, Sequence, Optional, cast
from fastapi import APIRouter, Depends, Query
from fastapi.responses import PlainTextResponse
from loguru import logger

from pydantic import TypeAdapter

from ..controllers.auth import get_user
from ..controllers.metar import fetch_metar
from ..views.sector import Airport
from ..models import User

from ...config import settings
from ..utils.redis import RedisClient
from ..views.atis import Atis
from ..views.metar import AirportIcao


router = APIRouter()


@router.get(
    "/atis/",
)
async def atis_get(
    airports: Annotated[Sequence[AirportIcao], Query(alias="icao")],
    user: Annotated[User, Depends(get_user)],
) -> Dict[str, Atis]:
    """Get Atis for airport."""
    redis_client = RedisClient.open()

    atis = {}
    for icao in airports:
        icao = icao.upper()
        atis_json = cast(Optional[str], await redis_client.get(f"vatsim:atis:{icao}"))
        if atis_json is None:
            continue
        atis[icao] = TypeAdapter(Atis).validate_json(atis_json)

    return atis


@router.get(
    "/atis/generate",
    response_class=PlainTextResponse,
)
async def atis_generate(
    arrivalRunwayStr: Annotated[str, Query(alias="arr")],
    departureRunwayStr: Annotated[str, Query(alias="dep")],
    atisCode: Annotated[str, Query(alias="info")],
    airport: Annotated[str, Query(alias="airport")],
    approachType: Annotated[str, Query(alias="apptype")] = "ILS",
    departureFrequency: Annotated[Optional[str], Query(alias="depfreq")] = None,
) -> str:
    airports: Dict[str, Airport] = {}
    async with RedisClient.open() as redis_client:
        for region in settings.SECTOR_REGIONS:
            airports_json = await redis_client.get(f"sector:airports:{region}")
            if airports_json is None:
                logger.warning(f"No data for {region}")
                continue

            airports = airports | TypeAdapter(Dict[str, Airport]).validate_json(
                airports_json
            )
    airport_name = (
        airports[airport].callsign.upper() if airport in airports else airport
    )

    arrivalRunways = [rwy.upper() for rwy in arrivalRunwayStr.split(",")]
    departureRunways = [rwy.upper() for rwy in departureRunwayStr.split(",")]

    def concatSep(lst: Sequence[str | None], sep: str = " ") -> str:
        return sep.join(e for e in lst if e is not None)

    expectApproach = concatSep(
        [
            "EXPECT VECTORS FOR",
            ("INDEPENDENT PARALLEL" if len(arrivalRunways) >= 2 else None),
            f"{approachType} APPROACH",
            " AND ".join(sorted(arrivalRunways)),
        ]
    )
    allActiveRunways = sorted(set(departureRunways + arrivalRunways))
    runwaysInUse = concatSep(
        [
            f"RUNWAY{'S' if len(allActiveRunways) > 1 else ''} IN USE",
            " AND ".join(allActiveRunways),
        ]
    )

    metar = await fetch_metar(airport)
    if metar is None:
        return concatSep(
            [
                f"{airport} INFORMATION {atisCode} MET REPORT UNAVAILABLE",
                expectApproach,
                runwaysInUse,
                f"INFORMATION {atisCode} OUT\n",
            ],
            " .. ",
        )

    depfreq_block = (
        "ATTENTION! DEPARTURE FREQUENCY FOR ALL AIRCRAFT IS " + departureFrequency
        if departureFrequency is not None
        else None
    )

    def avail(o: None | float, f: str = "{}") -> str:
        return f.format(int(o)) if o is not None else "UNAVAILABLE"

    wind = (
        "CALM"
        if metar.wind_speed is None or metar.wind_speed == 0
        else concatSep(
            [
                f"{int(metar.wind_dir)} DEGREES"
                if metar.wind_dir is not None
                else "VARIABLE",
                f"{int(metar.wind_speed)} KNOT"
                + ("S" if int(metar.wind_speed) > 1 else ""),
                f"GUSTING MAX {int(metar.wind_gust)} KNOTS"
                if metar.wind_gust is not None
                else None,
                (
                    f"VARIABLE BETWEEN {int(metar.wind_dir_from)} "
                    + f"AND {int(metar.wind_dir_to)} DEGREES"
                )
                if metar.wind_dir_from is not None and metar.wind_dir_to is not None
                else None,
            ]
        )
    )

    visibility = (
        "UNAVAILABLE"
        if metar.vis is None
        else f"{int((metar.vis+1)/1000)} KILOMETERS"
        if metar.vis >= 5000
        else f"{int(metar.vis)} METERS"
    )

    trends = {
        "U": "UPGRADING",
        "D": "DOWNGRADING",
        "N": "NEUTRAL",
        None: "",
    }
    rvr = (
        (
            "RUNWAY VISUAL RANGE "
            + " ".join(
                concatSep(
                    [f"RUNWAY {r.runway} {int(r.low)} METERS", trends.get(r.trend)]
                )
                for r in metar.rvr
            )
        )
        if len(metar.rvr) > 0
        else None
    )

    weather = metar.weather_text.upper().replace(";", "")

    def coverToStr(cover: str) -> str:
        return {
            "SCT": "SCATTERED",
            "FEW": "FEW",
            "BKN": "BROKEN",
            "OVC": "OVERCAST",
            "NCD": "NOT DETECTED",
        }.get(cover, "UNKNOWN")

    clouds = (
        "CAVOK"
        if len(metar.clouds) == 0
        else "NO SIGNIFICANT CLOUDS"
        if len(metar.clouds) == 1 and metar.clouds[0].cover == "NSC"
        else "CLOUDS "
        + (
            " ".join(
                concatSep(
                    [
                        coverToStr(cloudlayer.cover),
                        cloudlayer.type_text,
                        f"{int(cloudlayer.height)} FEET"
                        if cloudlayer.height is not None
                        else None,
                    ]
                )
                for cloudlayer in metar.clouds
            )
        )
    )

    return concatSep(
        [
            f"{airport_name} INFORMATION {atisCode} "
            + ("AUTOMATIC " if metar.automatic else "")
            + f"MET REPORT TIME {metar.time.strftime('%H%M')}",
            expectApproach,
            runwaysInUse,
            f"TRANSITION LEVEL {metar.tl}",
            depfreq_block,
            f"WIND {wind}",
            f"VISIBILITY {visibility}",
            rvr,
            weather if weather != "" else None,
            clouds,
            f"TEMPERATURE {avail(metar.temp)} DEW POINT {avail(metar.dewpt)}",
            "QNH " + avail(metar.qnh, "{} HECTOPASCAL"),
            metar.recent_weather_text if metar.recent_weather_text else None,
            # TODO
            # metar.trend if metar.trend else None,
            f"INFORMATION {atisCode} OUT\n",
        ],
        " .. ",
    )
