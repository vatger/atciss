"""loa_datasource_switch

Revision ID: e0d116db386c
Revises: d98466b8fc3d
Create Date: 2025-02-15 09:20:19.979424+00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e0d116db386c"
down_revision: str | None = "d98466b8fc3d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    _ = op.create_table(
        "loaitem",
        sa.Column("from_sector", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("to_sector", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("adep", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("ades", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("runway", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("cop", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("route_before", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("route_after", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("level", sa.Integer(), nullable=True),
        sa.Column("sfl", sa.Integer(), nullable=True),
        sa.Column("level_at", sa.JSON(), nullable=True),
        sa.Column("qnh", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("remarks", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("vertical", sa.Boolean(), nullable=False),
        sa.Column("areas", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("rfl", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("transfer_type", sa.String(), nullable=True),
        sa.Column("releases", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("loaitem")
    # ### end Alembic commands ###
