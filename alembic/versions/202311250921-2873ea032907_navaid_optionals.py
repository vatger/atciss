"""navaid_optionals

Revision ID: 2873ea032907
Revises: dce45fd6905a
Create Date: 2023-11-25 09:21:25.490417+00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "2873ea032907"
down_revision: str | None = "dce45fd6905a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("navaid", "name", existing_type=sa.VARCHAR(), nullable=True)


def downgrade() -> None:
    op.alter_column("navaid", "name", existing_type=sa.VARCHAR(), nullable=False)
