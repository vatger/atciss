"""agreements_create

Revision ID: 3a217aa7c14b
Revises: 3f916bf1ccf7
Create Date: 2023-12-23 21:01:34.413243+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "3a217aa7c14b"
down_revision: Union[str, None] = "3f916bf1ccf7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "agreements",
        sa.Column("fir", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("text", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("changed_by_cid", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("fir"),
    )


def downgrade() -> None:
    op.drop_table("agreements")
