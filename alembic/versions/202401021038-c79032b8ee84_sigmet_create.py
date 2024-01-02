"""sigmet_create

Revision ID: c79032b8ee84
Revises: 460aeb461c32
Create Date: 2024-01-02 10:38:18.439616+00:00

"""
from typing import Sequence, Union

from alembic import op
import geoalchemy2
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "c79032b8ee84"
down_revision: Union[str, None] = "460aeb461c32"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "sigmet",
        sa.Column("isigmetId", sa.Integer(), nullable=False),
        sa.Column("icaoId", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("firId", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("receiptTime", sa.DateTime(timezone=True), nullable=False),
        sa.Column("validTimeFrom", sa.DateTime(timezone=True), nullable=False),
        sa.Column("validTimeTo", sa.DateTime(timezone=True), nullable=False),
        sa.Column("seriesId", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("hazard", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("qualifier", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("base", sa.Integer(), nullable=True),
        sa.Column("top", sa.Integer(), nullable=True),
        sa.Column("geom", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("dir", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("spd", sa.Integer(), nullable=True),
        sa.Column("chng", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column(
            "coords",
            geoalchemy2.types.Geometry(
                geometry_type="POLYGON", from_text="ST_GeomFromEWKT", name="geometry"
            ),
            nullable=True,
        ),
        sa.Column("rawSigmet", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.PrimaryKeyConstraint("isigmetId"),
    )


def downgrade() -> None:
    op.drop_table("sigmet")
