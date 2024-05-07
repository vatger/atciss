from collections.abc import Sequence
from typing import Annotated, cast

from fastapi import APIRouter, Depends, Query
from fastapi.responses import ORJSONResponse, PlainTextResponse
from loguru import logger
from pydantic import TypeAdapter
from vatsim.types import Atis

from atciss.app.controllers.metar import fetch_metar
from atciss.app.utils.redis import Redis, get_redis
from atciss.app.views.metar import AirportIcao
from atciss.app.views.sector import Airport
from atciss.config import settings

router = APIRouter()


@router.get(
    "/atis",
    response_class=ORJSONResponse,
)
async def atis_get(
    airports: Annotated[Sequence[AirportIcao], Query(alias="icao", default_factory=list)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> dict[str, Atis]:
    """Get Atis for airport."""

    atis = {}
    for icao in airports:
        icao = icao.upper()
        atis_json = cast(str | None, await redis.get(f"vatsim:atis:{icao}"))
        if atis_json is None:
            continue
        atis[icao] = TypeAdapter(Atis).validate_json(atis_json)

    return atis


@router.get(
    "/atis/generate",
    response_class=PlainTextResponse,
)
async def atis_generate(
    redis: Annotated[Redis, Depends(get_redis)],
    arrivalRunwayStr: Annotated[str, Query(alias="arr")],
    departureRunwayStr: Annotated[str, Query(alias="dep")],
    atisCode: Annotated[str, Query(alias="info")],
    airport: Annotated[str, Query(alias="airport")],
    approachType: Annotated[str, Query(alias="apptype")] = "ILS",
    lvp: Annotated[bool, Query(alias="lvp")] = False,
    departureFrequency: Annotated[str | None, Query(alias="depfreq")] = None,
) -> str:
    airports: dict[str, Airport] = {}
    for region in settings.SECTOR_REGIONS:
        airports_json = await redis.get(f"sector:airports:{region}")
        if airports_json is None:
            logger.warning(f"No data for {region}")
            continue

        airports = airports | TypeAdapter(dict[str, Airport]).validate_json(airports_json)
    airport_name = "".join(
        {"Ä": "AE", "Ü": "UE", "Ö": "OE", "ß": "ss"}.get(c, c)
        for c in (airports[airport].callsign.upper() if airport in airports else airport)
    )

    arrivalRunways = [rwy.upper() for rwy in arrivalRunwayStr.split(",")]
    departureRunways = [rwy.upper() for rwy in departureRunwayStr.split(",")]

    def concatSep(lst: Sequence[str | None], sep: str = " ") -> str:
        return sep.join(e for e in lst if e is not None)

    expectApproach = concatSep([
        "EXPECT VECTORS FOR",
        ("INDEPENDENT PARALLEL" if len(arrivalRunways) >= 2 else None),
        f"{approachType} APPROACH",
    ])
    allActiveRunways = set(departureRunways + arrivalRunways)
    singleUseOfRunwayOps = not (
        set(departureRunways) == allActiveRunways and set(arrivalRunways) == allActiveRunways
    )
    runwaysInUse = concatSep(
        [
            f"RUNWAY{'S' if len(allActiveRunways) > 1 else ''} IN USE",
            " AND ".join(sorted(allActiveRunways)),
        ]
        + (
            [
                f"MAIN LANDING RUNWAY{'S' if len(arrivalRunways) > 1 else ''}",
                " AND ".join(arrivalRunways),
                f"DEPARTURE RUNWAY{'S' if len(departureRunways) > 1 else ''}",
                " AND ".join(departureRunways),
            ]
            if singleUseOfRunwayOps
            else []
        ),
    )

    metar = await fetch_metar(airport, redis)
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

    lowvis = "LOW VISIBILITY PROCEDURES IN OPERATION CATEGORY 2 AND 3 AVAILABLE" if lvp else None

    def avail(o: None | float, f: str = "{}") -> str:
        return f.format(int(o)) if o is not None else "UNAVAILABLE"

    wind = (
        "CALM"
        if metar.wind_speed is None or metar.wind_speed == 0
        else concatSep([
            f"{int(metar.wind_dir):03} DEGREES" if metar.wind_dir is not None else "VARIABLE",
            f"{int(metar.wind_speed)} KNOT" + ("S" if int(metar.wind_speed) > 1 else ""),
            f"GUSTING MAX {int(metar.wind_gust)} KNOTS" if metar.wind_gust is not None else None,
            (
                f"VARIABLE BETWEEN {int(metar.wind_dir_from):03} "
                f"AND {int(metar.wind_dir_to):03} DEGREES"
            )
            if metar.wind_dir_from is not None and metar.wind_dir_to is not None
            else None,
        ])
    )

    def formatvis(rng: float):
        return f"{int((rng + 1) / 1000)} KILOMETERS" if rng >= 5000 else f"{int(rng)} METERS"

    visibility = (
        "UNAVAILABLE"
        if len(metar.vis) == 0
        else concatSep([
            formatvis(metar.vis[0]),
            f"MINIMUM {formatvis(metar.vis[1])}" if len(metar.vis) > 1 else None,
        ])
    )

    trends = {
        "U": "UPGRADING",
        "D": "DOWNGRADING",
        "N": "NEUTRAL",
        None: "",
    }
    rvr = (
        (
            "RVR "
            + " ".join(
                concatSep([f"RUNWAY {r.runway} {int(r.low)} METERS", trends.get(r.trend)])
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
            concatSep([
                concatSep([
                    coverToStr(cloudlayer.cover),
                    cloudlayer.type_text.upper() if cloudlayer.type_text is not None else None,
                    f"{int(cloudlayer.height)} FEET" if cloudlayer.height is not None else None,
                ])
                for cloudlayer in metar.clouds
            ])
        )
    )

    return concatSep(
        [
            f"{airport_name} INFORMATION {atisCode} "
            + ("AUTOMATIC " if metar.automatic else "")
            + f"MET REPORT TIME {metar.time.strftime('%H%M')}",
            expectApproach,
            runwaysInUse,
            depfreq_block,
            lowvis,
            f"TRANSITION LEVEL {metar.tl}",
            f"WIND {wind}",
            f"VISIBILITY {visibility}",
            rvr,
            f"PRESENT WEATHER {weather}" if weather != "" else None,
            clouds,
            f"TEMPERATURE {avail(metar.temp)} DEW POINT {avail(metar.dewpt)}",
            "QNH " + avail(metar.qnh, "{} HPA"),
            "RECENT " + metar.recent_weather_text if metar.recent_weather_text else None,
            metar.trend or None,
            f"INFORMATION {atisCode} OUT\n",
        ],
        " .. ",
    )
