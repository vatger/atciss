from math import copysign
from typing import Tuple


Coordinate = Tuple[float, float]


def convert_degsecmin_coordinate(coordinate: str) -> float:
    sec = float(coordinate[-2:])
    minutes = float(coordinate[-4:-2])
    deg = float(coordinate[:-4])

    return deg + copysign(minutes, deg) / 60 + copysign(sec, deg) / 3600
