import uuid

from sqlmodel import Field, SQLModel, UniqueConstraint


class InitialsBase(SQLModel):
    cid: str
    fir: str
    initials: str


class Initials(InitialsBase, table=True):
    __table_args__ = (UniqueConstraint("cid", "fir"), UniqueConstraint("initials", "fir"))
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
