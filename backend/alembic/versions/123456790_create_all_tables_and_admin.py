"""create all tables and admin account

Revision ID: 123456789abc
Revises: 
Create Date: 2025-02-10 10:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import func

# revision identifiers, used by Alembic.
revision = '123456789abc'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Если таблицы уже существуют, их можно удалить (только для разработки!)
    op.execute("DROP TABLE IF EXISTS favorites CASCADE")
    op.execute("DROP TABLE IF EXISTS books CASCADE")
    op.execute("DROP TABLE IF EXISTS users CASCADE")

    # Создание таблицы пользователей
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False, server_default='Customer'),
        sa.Column('registration_date', sa.DateTime(), server_default=func.now(), nullable=False),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('verification_code', sa.String(), nullable=True),
    )

    # Создание таблицы книг
    op.create_table(
        'books',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('authors', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('genres', sa.String(), nullable=False, server_default='Fiction'),
        sa.Column('pdf_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=func.now(), nullable=False),
    )

    # Создание таблицы избранного (связь многие ко многим)
    op.create_table(
        'favorites',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('book_id', sa.Integer(), sa.ForeignKey('books.id'), primary_key=True),
        sa.UniqueConstraint('user_id', 'book_id', name='uix_user_book')
    )

    # Генерация и вставка учётной записи администратора.
    # Сначала сгенерируйте реальный хэш для пароля "admin123" с помощью passlib.
    admin_hashed_password = "$2b$12$GZv.MCA2HAwg4c4k/Lxu8OHU8ueVwtc1z/NGBwXvYlwv5tyGHsaq6"  # Замените на реальный хэш
    stmt = sa.text("""
        INSERT INTO users (email, hashed_password, name, role, registration_date, is_verified)
        VALUES (:email, :hashed_password, :name, :role, NOW(), true)
    """).bindparams(
        email="admin@example.com",
        hashed_password=admin_hashed_password,
        name="Administrator",
        role="Admin"
    )
    op.execute(stmt)

def downgrade():
    op.drop_table('favorites')
    op.drop_table('books')
    op.drop_table('users')
