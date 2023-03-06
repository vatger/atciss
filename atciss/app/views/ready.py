"""Application implementation - ready response."""
from typing import Any, Dict

from pydantic import BaseModel


class ReadyResponse(BaseModel):
    """Define ready response model.

    Attributes:
        status (str): Strings are accepted as-is, int float and Decimal are
            coerced using str(v), bytes and bytearray are converted using
            v.decode(), enums inheriting from str are converted using
            v.value, and all other types cause an error.

    Raises:
        pydantic.error_wrappers.ValidationError: If any of provided attribute
            doesn't pass type validation.
    """

    status: str

    class Config:
        """Override model config."""

        @staticmethod
        def schema_extra(schema: Dict[str, Any]) -> None:
            """Override extra schema."""
            # Override schema description, by default is taken from docstring.
            schema["description"] = "Ready response model."
