"""Add password_hash to Admin

Revision ID: add_password_hash_001
Revises: 8d6be5b70d6b
Create Date: 2025-10-29 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = 'add_password_hash_001'
down_revision = '8d6be5b70d6b'  # Previous migration's revision ID
branch_labels = None
depends_on = None

def upgrade():
    # Add password_hash column as nullable first
    op.add_column('admin',
        sa.Column('password_hash', sa.String(length=128), nullable=True)
    )
    
    # Then make it non-nullable after existing rows are handled
    op.alter_column('admin', 'password_hash',
        existing_type=sa.String(length=128),
        nullable=False
    )

def downgrade():
    op.drop_column('admin', 'password_hash')