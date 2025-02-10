import os

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:00723@localhost:5432/onlinelib")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

settings = Settings()
