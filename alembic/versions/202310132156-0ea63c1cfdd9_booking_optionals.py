"""booking_optionals

Revision ID: 0ea63c1cfdd9
Revises: 93e1cd8acb53
Create Date: 2023-10-13 21:56:12.294724+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0ea63c1cfdd9"
down_revision: Union[str, None] = "93e1cd8acb53"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "booking",
        "start",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
    )
    op.alter_column(
        "booking",
        "end",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
    )
    op.alter_column("booking", "division", existing_type=sa.VARCHAR(), nullable=True)


def downgrade() -> None:
    op.alter_column("booking", "division", existing_type=sa.VARCHAR(), nullable=False)
    op.alter_column(
        "booking",
        "end",
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        existing_nullable=False,
    )
    op.alter_column(
        "booking",
        "start",
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        existing_nullable=False,
    )
