"""sigmet_isigmetid_to_string

Revision ID: b0690f3305a5
Revises: e0d116db386c
Create Date: 2026-06-20 22:14:30.384369+00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b0690f3305a5"
down_revision: str | None = "e0d116db386c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column(
        "sigmet",
        "isigmetId",
        existing_type=sa.INTEGER(),
        type_=sqlmodel.sql.sqltypes.AutoString(),
        existing_nullable=False,
        postgresql_using='"isigmetId"::varchar',
    )


def downgrade() -> None:
    op.alter_column(
        "sigmet",
        "isigmetId",
        existing_type=sqlmodel.sql.sqltypes.AutoString(),
        type_=sa.INTEGER(),
        existing_nullable=False,
        postgresql_using='"isigmetId"::integer',
    )
