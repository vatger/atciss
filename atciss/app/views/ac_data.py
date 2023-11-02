from dataclasses import dataclass
from typing import Any, Optional, Sequence


@dataclass
class AcdbManufacturer:
    id: str
    country: Optional[str]
    name: str
    nativeName: Optional[str]


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
    iataCode: Optional[str]
    icaoCode: Optional[str]
    manufacturer: str
    name: str
    propertyValues: Sequence[AcdbAcProperty]
