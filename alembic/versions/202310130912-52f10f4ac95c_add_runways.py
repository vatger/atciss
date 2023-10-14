"""add runways

Revision ID: 52f10f4ac95c
Revises: 93e1cd8acb53
Create Date: 2023-10-13 09:12:28.343343+00:00

"""
from typing import Sequence, Union
from sqlalchemy import UUID

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "52f10f4ac95c"
down_revision: Union[str, None] = "93e1cd8acb53"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    _ = op.create_table(
        "runway",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("aerodrome_id", UUID(as_uuid=True), nullable=False),
        sa.Column("designator", sqlmodel.AutoString(), nullable=False),
        sa.Column("length", sa.Float(), nullable=True),
        sa.Column("width", sa.Float(), nullable=True),
        sa.Column("surface", sqlmodel.AutoString(), nullable=True),
        sa.ForeignKeyConstraint(
            ["aerodrome_id"], ["aerodrome.id"], name="runway_aerodrome_id"
        ),
    )

    _ = op.create_table(
        "runway_direction",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("runway_id", UUID(as_uuid=True), nullable=False),
        sa.Column("designator", sqlmodel.AutoString(), nullable=False),
        sa.Column("true_bearing", sa.Float(), nullable=True),
        sa.Column("magnetic_bearing", sa.Float(), nullable=True),
        sa.Column("guidance", sqlmodel.AutoString(), nullable=True),
        sa.ForeignKeyConstraint(
            ["runway_id"], ["runway.id"], name="runway_direction_runway_id"
        ),
    )


def downgrade() -> None:
    op.drop_table("runway_direction")
    op.drop_table("runway")
