"""aerodrome_navaid_source

Revision ID: 2b6394ea5779
Revises: 81848795e2fa
Create Date: 2023-11-28 00:19:54.676953+00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "2b6394ea5779"
down_revision: str | None = "81848795e2fa"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "aerodrome", sa.Column("source", sqlmodel.sql.sqltypes.AutoString(), nullable=True)
    )
    op.execute(
        sa.table(
            "aerodrome", sa.Column("source", sqlmodel.sql.sqltypes.AutoString(), nullable=True)
        )
        .update()
        .values(source="DFS")
    )
    op.alter_column("aerodrome", "source", nullable=False)
    op.add_column("navaid", sa.Column("source", sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.execute(
        sa.table("navaid", sa.Column("source", sqlmodel.sql.sqltypes.AutoString(), nullable=True))
        .update()
        .values(source="DFS")
    )
    op.alter_column("navaid", "source", nullable=False)


def downgrade() -> None:
    op.drop_column("aerodrome", "source")
    op.drop_column("navaid", "source")
