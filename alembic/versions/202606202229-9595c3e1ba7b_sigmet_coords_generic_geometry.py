"""sigmet_coords_generic_geometry

Revision ID: 9595c3e1ba7b
Revises: b0690f3305a5
Create Date: 2026-06-20 22:29:33.968835+00:00

"""
from typing import Sequence, Union

from alembic import op
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = '9595c3e1ba7b'
down_revision: Union[str, None] = 'b0690f3305a5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('sigmet', 'coords',
               existing_type=geoalchemy2.types.Geometry(geometry_type='POLYGON', dimension=2, from_text='ST_GeomFromEWKT', name='geometry', _spatial_index_reflected=True),
               type_=geoalchemy2.types.Geometry(dimension=2, from_text='ST_GeomFromEWKT', name='geometry'),
               existing_nullable=True)


def downgrade() -> None:
    op.alter_column('sigmet', 'coords',
               existing_type=geoalchemy2.types.Geometry(dimension=2, from_text='ST_GeomFromEWKT', name='geometry'),
               type_=geoalchemy2.types.Geometry(geometry_type='POLYGON', dimension=2, from_text='ST_GeomFromEWKT', name='geometry', _spatial_index_reflected=True),
               existing_nullable=True)
