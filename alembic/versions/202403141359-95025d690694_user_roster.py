"""user roster

Revision ID: 95025d690694
Revises: c79032b8ee84
Create Date: 2024-03-14 13:59:33.068828+00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "95025d690694"
down_revision: str | None = "c79032b8ee84"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "user", sa.Column("rostered", sa.Boolean(), nullable=False, server_default="false")
    )


def downgrade() -> None:
    op.drop_column("user", "rostered")
