import sqlalchemy
from loa import Agreement
from loa.agreement import ReleaseTypes, TransferTypes
from sqlmodel import JSON, Column, Field, SQLModel, String


class LoaItem(Agreement, SQLModel, table=True):
    id: int = Field(primary_key=True)
    adep: list[str] | None = Field(
        default=None, sa_column=Column(sqlalchemy.dialects.postgresql.ARRAY(String()))
    )
    ades: list[str] | None = Field(
        default=None, sa_column=Column(sqlalchemy.dialects.postgresql.ARRAY(String()))
    )
    runway: list[str] | None = Field(
        default=None, sa_column=Column(sqlalchemy.dialects.postgresql.ARRAY(String()))
    )
    level_at: tuple[int, str] | None = Field(sa_column=Column(JSON), default=None)
    areas: list[str] = Field(
        default_factory=list, sa_column=Column(sqlalchemy.dialects.postgresql.ARRAY(String()))
    )
    transfer_type: TransferTypes | None = Field(default=None, sa_column=Column(String))
    releases: ReleaseTypes | None = Field(default=None, sa_column=Column(String))
