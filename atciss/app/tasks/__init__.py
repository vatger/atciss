"""Background tasks."""
from .metar import fetch_metar
from .notam import fetch_notam


__all__ = ("fetch_notam", "fetch_metar")
