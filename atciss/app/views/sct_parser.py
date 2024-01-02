import itertools
import sys
from dataclasses import dataclass
from typing import Sequence, cast
from pydantic import TypeAdapter

from lark import Discard, Lark, Transformer

from atciss.app.utils.geo import Coordinate
from atciss.app.views.aerodrome import Aerodrome
from atciss.app.views.navaid import Navaid


@dataclass
class SctRunway:
    ad_designator: str
    designator: str
    heading: int
    thresholds: tuple[Coordinate, Coordinate]


@dataclass
class SctSection:
    name: str
    data: list[Navaid | Aerodrome | SctRunway]


@dataclass
class SctFile:
    sections: dict[str, list[Navaid | Aerodrome | SctRunway]]

    def navaids(self) -> list[Navaid]:
        return cast(
            list[Navaid], self.sections["VOR"] + self.sections["NDB"] + self.sections["FIXES"]
        )

    def aerodromes(self) -> list[Aerodrome]:
        return cast(list[Aerodrome], self.sections["AIRPORT"])


class SctTransformer(Transformer):
    INT = int
    DECIMAL = float
    DEG = int
    MIN = int
    SEC = float
    HEADER_NAME = str
    DESIGNATOR = str
    FIX_DESIGNATOR = str
    RUNWAY_DESIGNATOR = str

    # TODO: unparsed lines, either not implemented or broken format
    def broken(self, _):
        return Discard

    # TODO regions, airways, sectors, ...
    def start(self, children: list[SctSection]) -> SctFile:
        return SctFile(
            {
                s.name: s.data
                for s in children
                if s.name in ["VOR", "NDB", "FIXES", "AIRPORT", "RUNWAY"]
            }
        )

    def section(self, children: Sequence[str | Navaid | Aerodrome | list[SctRunway]]) -> SctSection:
        name, *rest = children
        if name == "RUNWAY":
            rest = itertools.chain.from_iterable(cast(list[list[SctRunway]], rest))
        return SctSection(cast(str, name), cast(list[Navaid | Aerodrome | SctRunway], list(rest)))

    def coord_part(self, children: tuple[str, int, int, float]) -> float:
        hemi, deg, min, sec = children
        return (-1 if hemi in ["N", "E"] else 1) * (deg + min / 60 + sec / 3600)

    def coordinate(self, children: tuple[float, float]) -> Coordinate:
        lat, lng = children
        return (lat, lng)

    def location(self, children: tuple[str, float, Coordinate]) -> Navaid | Aerodrome:
        designator, frequency, location = children
        if frequency > 0 and frequency < 150:
            return Navaid.model_validate(
                {
                    "designator": designator,
                    "type": "VOR",
                    "frequency": frequency,
                    "location": location,
                    "aerodrome_id": None,
                    "runway_direction_id": None,
                    "source": "SCT",
                }
            )
        elif frequency > 150:
            return Navaid.model_validate(
                {
                    "designator": designator,
                    "type": "NDB",
                    "frequency": frequency,
                    "location": location,
                    "aerodrome_id": None,
                    "runway_direction_id": None,
                    "source": "SCT",
                }
            )
        else:
            return Aerodrome.model_validate(
                {
                    "icao_designator": designator,
                    "type": "AD",
                    "arp_location": location,
                    "source": "SCT",
                }
            )

    def fix(self, children: tuple[str, Coordinate]) -> Navaid:
        designator, location = children

        return Navaid.model_validate(
            {
                "designator": designator,
                "type": "ICAO",
                "location": location,
                "aerodrome_id": None,
                "runway_direction_id": None,
                "source": "SCT",
            }
        )

    def runway(self, children: tuple[str, str, int, int, Coordinate, Coordinate, str]):
        des1, des2, deg1, deg2, thr1, thr2, icao = children

        return [
            SctRunway(icao, des1, deg1, (thr1, thr2)),
            SctRunway(icao, des2, deg2, (thr2, thr1)),
        ]


def parse(input: str) -> SctFile:
    parser = Lark.open("sct.lark", rel_to=__file__)

    tree = parser.parse(input)
    # with open("pretty_tree", "w") as pf:
    #     pf.write(tree.pretty())
    tf = SctTransformer()

    return tf.transform(tree)


if __name__ == "__main__":
    with open(sys.argv[1], encoding="windows-1252") as f:
        sct = parse(f.read())
        print(TypeAdapter(SctFile).dump_json(sct).decode("utf-8"))
