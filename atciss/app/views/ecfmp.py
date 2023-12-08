from dataclasses import dataclass
from typing import Any, Literal, Optional

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
    event_vatcan: Optional[str]


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
    value: Optional[int | list[str]]


class FlowMeasure(BaseModel):
    ident: str
    event_id: Optional[int]
    reason: str
    starttime: AwareDatetime
    endtime: AwareDatetime
    measure: Measure
    filters: list[Filter]
    notified_firs: list[str]
    withdrawn_at: Optional[AwareDatetime]


class ECFMP(BaseModel):
    events: list[Event]
    flight_information_regions: list[FIR]
    flow_measures: list[FlowMeasure]

    @model_validator(mode="before")
    @classmethod
    def replace_fir_id(cls, input: Any) -> Any:
        flow_measures = [
            fm
            | {
                "notified_firs": fm.get("notified_firs")
                or [
                    next(
                        (
                            fir["identifier"]
                            for fir in input["flight_information_regions"]
                            if fir["id"] == fir_id
                        ),
                        "ZZZZ",
                    )
                    for fir_id in fm["notified_flight_information_regions"]
                ]
            }
            for fm in input["flow_measures"]
        ]
        events = [
            e
            | {
                "fir": e.get("fir")
                or next(
                    (
                        fir["identifier"]
                        for fir in input["flight_information_regions"]
                        if fir["id"] == e["flight_information_region_id"]
                    ),
                    "ZZZZ",
                )
            }
            for e in input["events"]
        ]

        return input | {"flow_measures": flow_measures, "events": events}
