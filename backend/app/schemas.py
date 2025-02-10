from pydantic import BaseModel, EmailStr, constr, validator
from typing import Optional, List
from datetime import datetime

# Список разрешённых жанров (можете изменить)
ALLOWED_GENRES = [
    "Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction",
    "Fantasy", "Horror", "Biography", "History", "Poetry", "Adventure",
    "Thriller", "Self-Help"
]

# Схемы для книг

class BookCreate(BaseModel):
    title: str
    authors: str
    description: Optional[str] = None
    genre: constr(strip_whitespace=True)

    @validator("genre")
    def validate_genre(cls, v):
        if v not in ALLOWED_GENRES:
            raise ValueError(f"Genre must be one of {ALLOWED_GENRES}")
        return v

class BookUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[constr(strip_whitespace=True)] = None

    @validator("genre")
    def validate_genre(cls, v):
        if v is not None and v not in ALLOWED_GENRES:
            raise ValueError(f"Genre must be one of {ALLOWED_GENRES}")
        return v

class BookOut(BaseModel):
    id: int
    title: str
    authors: str
    description: Optional[str] = None
    genre: str
    pdf_id: Optional[str] = None
    created_at: datetime  # Изменено с str на datetime

    class Config:
        orm_mode = True

# Схемы для пользователей

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    # Пользователь не вводит пароль – система генерирует код

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: str
    registration_date: datetime
    is_verified: bool

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    code: str  # используем код, который был отправлен на почту

class Token(BaseModel):
    access_token: str
    token_type: str