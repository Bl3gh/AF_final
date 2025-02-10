from sqlalchemy import (
    Table, Column, Integer, String, Boolean, DateTime, Text, ForeignKey, UniqueConstraint
)
from sqlalchemy.sql import func
from app.database import metadata

# Таблица пользователей (с полем verification_code для верификации)
users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("email", String, unique=True, nullable=False),
    Column("hashed_password", String, nullable=True),  # Может быть изначально None
    Column("name", String, nullable=False),
    Column("role", String, default="Customer"),
    Column("registration_date", DateTime, server_default=func.now(), nullable=False),
    Column("is_verified", Boolean, default=False),
    Column("verification_code", String, nullable=True),  # Сгенерированный код для верификации
)

# Таблица книг (добавлено поле genre и created_at)
books = Table(
    "books",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("title", String, nullable=False),
    Column("authors", String, nullable=False),
    Column("description", Text, nullable=True),
    Column("genre", String, nullable=False, default="Fiction"),
    Column("pdf_id", String, nullable=True),
    Column("created_at", DateTime, server_default=func.now(), nullable=False),
)

# Таблица избранного (связь между пользователями и книгами)
favorites = Table(
    "favorites",
    metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("book_id", Integer, ForeignKey("books.id"), primary_key=True),
    UniqueConstraint("user_id", "book_id", name="uix_user_book")
)
