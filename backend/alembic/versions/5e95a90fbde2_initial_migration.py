"""Initial migration

Revision ID: 123456789abc
Revises: 
Create Date: 2025-01-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '123456789abc'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Создание таблицы users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False, default="Customer"),
        sa.Column('registration_date', sa.DateTime(), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False, default=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )


def downgrade():
    # Удаление таблицы users
    op.drop_table('users')
