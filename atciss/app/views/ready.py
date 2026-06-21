"""Application implementation - ready response."""

from typing import Any

from pydantic import BaseModel, ConfigDict


def _json_schema_extra(schema: dict[str, Any]) -> None:
    # Override schema description, by default is taken from docstring.
    schema["description"] = "Ready response model."


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

    model_config = ConfigDict(json_schema_extra=_json_schema_extra)
