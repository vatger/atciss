"""enable postgis

Revision ID: a9f7418ba641
Revises: 32385a2daa3d
Create Date: 2023-10-02 21:36:52.282163+00:00

"""
from typing import Sequence, Union

from sqlalchemy import text
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a9f7418ba641"
down_revision: Union[str, None] = "923835204b3c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))


def downgrade() -> None:
    pass
