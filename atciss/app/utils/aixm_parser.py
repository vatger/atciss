from io import BytesIO
from typing import Any, BinaryIO, Union
from collections.abc import Iterable
import xmltodict


class AIXMFeature:
    class Value:
        def __init__(self, value: Any):
            super().__init__()
            self.value = value

        def get(self) -> str | None:
            return self.value

        def float(self) -> float | None:
            if self.value is None:
                return None

            return float(self.value)

        def int(self) -> int | None:
            if self.value is None:
                return None

            return int(self.value)

    def __init__(self, ftype: str, fid: str, data: dict[str, Any]):
        super().__init__()
        self.type = ftype
        self.id = fid
        self.data = data

    def __getitem__(self, key: str | tuple[str, ...]) -> Value:
        if isinstance(key, str):
            if key not in self.data:
                return AIXMFeature.Value(None)

            return AIXMFeature.Value(self.nil_to_none(self.data[key]))

        bit = self.data
        for item in key:
            if isinstance(bit, dict):
                if item not in bit:
                    return AIXMFeature.Value(None)

                bit = bit[item]
                if isinstance(bit, dict) and "@xsi:nil" in bit and bit["@xsi:nil"] == "true":
                    return AIXMFeature.Value(None)

        return AIXMFeature.Value(bit)

    @classmethod
    def nil_to_none(cls, value: Any) -> Any:
        if value is None:
            return None

        if isinstance(value, dict) and "@xsi:nil" in value and value["@xsi:nil"] == "true":
            return None

        return value


class AIXMData:
    def __init__(self, sources: Iterable[Union[str, BinaryIO, BytesIO]]):
        super().__init__()
        # AIXM message members, by message type
        self.members: dict[str, list[AIXMFeature]] = {}
        # Message members, by ID
        self.xlinks: dict[str, AIXMFeature] = {}

        for source in sources:
            self.parse(source)

    def parse(self, source: str | BinaryIO | BytesIO):
        """Parses an XML string or byte input into the instance data."""
        xml = xmltodict.parse(source)

        for member in xml["message:AIXMBasicMessage"]["message:hasMember"]:
            member_type = next(iter(member)).replace("aixm:", "")
            member_data = next(iter(member.values()))

            member_id = member_data["gml:identifier"]["#text"]

            feature = AIXMFeature(member_type, member_id, self.__get_current_timeslice(member_data))

            if member_type not in self.members:
                self.members[member_type] = []

            self.members[member_type].append(feature)
            self.xlinks[member_id] = feature

    def __get_current_timeslice(self, member: dict[str, Any]) -> dict[str, Any]:
        """Returns the currently valid timeslice,
        currently simplified to just return the first one."""

        return next(iter(member["aixm:timeSlice"].values()))

    def type(self, message_type: str) -> list[AIXMFeature]:
        """Returns messages of given type."""
        return self.members[message_type]

    def id(self, message_id: str) -> AIXMFeature:
        """Returns messages of given ID."""
        if message_id.startswith("urn:uuid:"):
            message_id = message_id[9:]

        return self.xlinks[message_id]
