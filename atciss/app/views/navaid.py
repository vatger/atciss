from dataclasses import dataclass
from typing import Optional, Sequence
from uuid import UUID

from geoalchemy2.shape import to_shape

from atciss.app.models import Navaid


@dataclass
class NavaidModel:
    id: UUID
    designator: str
    name: str
    type: str
    location: Sequence[float]
    channel: Optional[str]
    frequency: Optional[float]
    aerodrome: Optional[str]
    remark: Optional[str]
    operation_remark: Optional[str]

    @classmethod
    def from_db(cls, aid: Navaid) -> "NavaidModel":
        point = to_shape(aid.location)

        return cls(
            id=aid.id,
            designator=aid.designator,
            name=aid.name,
            type=aid.type,
            location=[point.y, point.x],
            channel=aid.channel,
            frequency=aid.frequency,
            aerodrome=None,
            remark=aid.remark,
            operation_remark=aid.operation_remark,
        )
