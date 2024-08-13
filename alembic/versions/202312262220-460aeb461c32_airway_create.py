"""airway_create

Revision ID: 460aeb461c32
Revises: 50fa2414e5eb
Create Date: 2023-12-26 22:20:32.821371+00:00

"""

from collections.abc import Sequence

import geoalchemy2
import sqlalchemy as sa
import sqlmodel

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "460aeb461c32"
down_revision: str | None = "50fa2414e5eb"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "airway",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("designatorPrefix", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("designatorSecondLetter", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("designatorNumber", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("locationDesignator", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "airwaysegment",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("level", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("true_track", sa.Float(), nullable=True),
        sa.Column("reverse_true_track", sa.Float(), nullable=True),
        sa.Column("length", sa.Float(), nullable=False),
        sa.Column("upper_limit", sa.Integer(), nullable=False),
        sa.Column("upper_limit_uom", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("lower_limit", sa.Integer(), nullable=False),
        sa.Column("lower_limit_uom", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("start_id", sa.Uuid(), nullable=False),
        sa.Column("end_id", sa.Uuid(), nullable=False),
        sa.Column("airway_id", sa.Uuid(), nullable=False),
        sa.Column(
            "curve_extent",
            geoalchemy2.types.Geometry(
                geometry_type="LINESTRING", from_text="ST_GeomFromEWKT", name="geometry"
            ),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["airway_id"],
            ["airway.id"],
        ),
        sa.ForeignKeyConstraint(
            ["end_id"],
            ["navaid.id"],
        ),
        sa.ForeignKeyConstraint(
            ["start_id"],
            ["navaid.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("airwaysegment")
    op.drop_table("airway")
