from dataclasses import dataclass
from typing import Any, Literal

from pydantic import AwareDatetime, BaseModel, model_validator


class Event(BaseModel):
    id: int
    name: str
    date_start: AwareDatetime
    date_end: AwareDatetime
    fir: str


@dataclass
class FIR:
    identifier: str
    name: str


@dataclass
class FilterEvent:
    event_id: int
    event_vatcan: str | None


@dataclass
class Filter:
    type: Literal[
        "ADEP",
        "ADES",
        "level_above",
        "level_below",
        "level",
        "member_event",
        "member_not_event",
        "waypoint",
    ]
    value: list[str | int] | int | FilterEvent


@dataclass
class Measure:
    type: Literal[
        "prohibit",
        "minimum_departure_interval",
        "average_departure_interval",
        "per_hour",
        "miles_in_trail",
        "max_ias",
        "max_mach",
        "ias_reduction",
        "mach_reduction",
        "ground_stop",
        "mandatory_route",
    ]
    value: int | list[str] | None


class FlowMeasure(BaseModel):
    ident: str
    event_id: int | None
    reason: str
    starttime: AwareDatetime
    endtime: AwareDatetime
    measure: Measure
    filters: list[Filter]
    notified_firs: list[str]
    withdrawn_at: AwareDatetime | None


class ECFMP(BaseModel):
    events: list[Event]
    flight_information_regions: list[FIR]
    flow_measures: list[FlowMeasure]

    @model_validator(mode="before")
    @classmethod
    def replace_fir_id(cls, inp: Any) -> Any:
        flow_measures = [
            fm
            | {
                "notified_firs": fm.get("notified_firs")
                or [
                    next(
                        (
                            fir["identifier"]
                            for fir in inp["flight_information_regions"]
                            if fir["id"] == fir_id
                        ),
                        "ZZZZ",
                    )
                    for fir_id in fm["notified_flight_information_regions"]
                ],
            }
            for fm in inp["flow_measures"]
        ]
        events = [
            e
            | {
                "fir": e.get("fir")
                or next(
                    (
                        fir["identifier"]
                        for fir in inp["flight_information_regions"]
                        if fir["id"] == e["flight_information_region_id"]
                    ),
                    "ZZZZ",
                ),
            }
            for e in inp["events"]
        ]

        return inp | {"flow_measures": flow_measures, "events": events}
