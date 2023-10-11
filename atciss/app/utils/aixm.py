from typing import Any, Optional
import pyaixm


def get_or_none(thing: Any):
    if isinstance(thing, pyaixm.aixm_types.Nil):
        return None

    return thing


def get_float_or_none(thing: Any) -> Optional[float]:
    gotten_thing = get_or_none(thing)
    if gotten_thing is None:
        return None

    return float(gotten_thing)
