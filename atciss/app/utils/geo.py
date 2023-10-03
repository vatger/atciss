from math import copysign
from typing import Tuple


Coordinate = Tuple[float, float]


def convert_degsecmin_coordinate(input: str) -> float:
    sec = float(input[-2:])
    min = float(input[-4:-2])
    deg = float(input[:-4])

    return deg + copysign(min, deg) / 60 + copysign(sec, deg) / 3600
