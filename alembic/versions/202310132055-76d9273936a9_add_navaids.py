"""add navaids

Revision ID: 76d9273936a9
Revises: 52f10f4ac95c
Create Date: 2023-10-13 20:55:28.422244+00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel
from geoalchemy2 import Geometry
from sqlalchemy import UUID

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "76d9273936a9"
down_revision: str | None = "52f10f4ac95c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    _ = op.create_table(
        "navaid",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("designator", sqlmodel.AutoString(), nullable=False, index=True),
        sa.Column("name", sqlmodel.AutoString(), nullable=False),
        sa.Column("type", sqlmodel.AutoString(), nullable=False),
        sa.Column("location", Geometry("POINT", srid=4326), nullable=False),
        sa.Column("channel", sqlmodel.AutoString(), nullable=True),
        sa.Column("frequency", sa.Float(), nullable=True),
        sa.Column("aerodrome_id", UUID(as_uuid=True), nullable=True),
        sa.Column("runway_direction_id", UUID(as_uuid=True), nullable=True),
        sa.Column("remark", sqlmodel.AutoString(), nullable=True),
        sa.Column("operation_remark", sqlmodel.AutoString(), nullable=True),
        sa.ForeignKeyConstraint(["aerodrome_id"], ["aerodrome.id"], name="navaid_aerodrome_id"),
        sa.ForeignKeyConstraint(
            ["runway_direction_id"],
            ["runway_direction.id"],
            name="navaid_runway_direction_id",
        ),
    )


def downgrade() -> None:
    op.drop_table("navaid")
