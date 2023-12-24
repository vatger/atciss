"""notam_seen_create

Revision ID: 50fa2414e5eb
Revises: 3a217aa7c14b
Create Date: 2023-12-24 00:45:40.496786+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "50fa2414e5eb"
down_revision: Union[str, None] = "3a217aa7c14b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "notamseen",
        sa.Column("notam_id", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("cid", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("notam_id", "cid"),
    )


def downgrade() -> None:
    op.drop_table("notamseen")
