from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any


@dataclass
class AcdbManufacturer:
    id: str
    country: str | None
    name: str
    nativeName: str | None


@dataclass
class AcdbAcProperty:
    property: str
    value: Any


@dataclass
class AcdbAcType:
    id: str
    aircraftFamily: str
    engineCount: int
    engineFamily: str
    engineModels: Sequence[str]
    iataCode: str | None
    icaoCode: str | None
    manufacturer: str
    name: str
    propertyValues: Sequence[AcdbAcProperty]
