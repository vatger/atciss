"""add aircraft data

Revision ID: dce45fd6905a
Revises: 0ea63c1cfdd9
Create Date: 2023-10-31 15:27:52.177403+00:00

"""
from typing import Sequence, Union

from sqlalchemy import UUID
import sqlalchemy as sa
import sqlmodel
from alembic import op


# revision identifiers, used by Alembic.
revision: str = "dce45fd6905a"
down_revision: Union[str, None] = "0ea63c1cfdd9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    _ = op.create_table(
        "ac_data",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("manufacturer", sqlmodel.AutoString(), nullable=False, index=True),
        sa.Column("model", sqlmodel.AutoString(), nullable=False, index=True),
        sa.Column("icao_designator", sqlmodel.AutoString(), nullable=True, index=True),
        sa.Column("iata_designator", sqlmodel.AutoString(), nullable=True, index=True),
        sa.Column("type", sqlmodel.AutoString(), nullable=False),
        sa.Column("engine_type", sqlmodel.AutoString(), nullable=True),
        sa.Column("engine_count", sa.Integer(), nullable=True),
        sa.Column("fuel_capacity", sa.Float(), nullable=True),
        sa.Column("service_ceiling", sa.Float(), nullable=True),
        sa.Column("wingspan", sa.Float(), nullable=True),
        sa.Column("length", sa.Float(), nullable=True),
        sa.Column("height", sa.Float(), nullable=True),
        sa.Column("max_speed_indicated", sa.Float(), nullable=True),
        sa.Column("max_speed_mach", sa.Float(), nullable=True),
        sa.Column("max_weight_taxi", sa.Float(), nullable=True),
        sa.Column("max_weight_takeoff", sa.Float(), nullable=True),
        sa.Column("max_weight_landing", sa.Float(), nullable=True),
        sa.Column("max_weight_zerofuel", sa.Float(), nullable=True),
        sa.Column("v_at", sa.Float(), nullable=True),
        sa.Column("cruise_tas", sa.Float(), nullable=True),
        sa.Column("cat_wtc", sqlmodel.AutoString(), nullable=True),
        sa.Column("cat_recat", sqlmodel.AutoString(), nullable=True),
        sa.Column("cat_app", sqlmodel.AutoString(), nullable=True),
        sa.Column("cat_arc", sqlmodel.AutoString(), nullable=True),
        sa.Column("remarks", sqlmodel.AutoString(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("ac_data")
