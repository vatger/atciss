"""aerodrome_optionals

Revision ID: 81848795e2fa
Revises: 2873ea032907
Create Date: 2023-11-25 12:21:11.895282+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "81848795e2fa"
down_revision: Union[str, None] = "2873ea032907"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("aerodrome", "name", existing_type=sa.VARCHAR(), nullable=True)


def downgrade() -> None:
    op.alter_column("ac_data", "type", existing_type=sa.VARCHAR(), nullable=False)
