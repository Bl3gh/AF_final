from sqlalchemy import create_engine, MetaData
from databases import Database

DATABASE_URL = "postgresql+psycopg2://postgres:12345@localhost:5432/onlinelib"

# Асинхронное подключение к PostgreSQL (через библиотеку "databases")
database = Database(DATABASE_URL)

# Объект MetaData нужен для описания таблиц (models.py)
metadata = MetaData()

# Синхронный engine (используется для create_all и в миграциях)
engine = create_engine(DATABASE_URL, echo=False)

# Внимание: metadata.create_all(engine) будем вызывать в main.py
