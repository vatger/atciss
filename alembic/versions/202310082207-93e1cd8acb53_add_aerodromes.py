"""add aerodromes

Revision ID: 93e1cd8acb53
Revises: 372cc1622626
Create Date: 2023-10-08 22:07:56.881130+00:00

"""
from typing import Sequence, Union

from alembic import op
from geoalchemy2 import Geometry
import sqlalchemy as sa
from sqlalchemy import UUID
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "93e1cd8acb53"
down_revision: Union[str, None] = "a9f7418ba641"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    _ = op.create_table(
        "aerodrome",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sqlmodel.AutoString(), nullable=False),
        sa.Column("type", sqlmodel.AutoString(), nullable=False),
        sa.Column("local_designator", sqlmodel.AutoString(), nullable=True),
        sa.Column("icao_designator", sqlmodel.AutoString(), nullable=True, index=True),
        sa.Column("iata_designator", sqlmodel.AutoString(), nullable=True),
        sa.Column("elevation", sa.Float(), nullable=True),
        sa.Column("mag_variation", sa.Float(), nullable=True),
        sa.Column("arp_location", Geometry("POINT", srid=4326), nullable=True),
        sa.Column("arp_elevation", sa.Float(), nullable=True),
        sa.Column("ifr", sa.Boolean, nullable=True),
    )


def downgrade() -> None:
    op.drop_table("aerodrome")
