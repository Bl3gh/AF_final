# app/schemas.py

from pydantic import BaseModel, EmailStr, constr, validator
from typing import Optional, List
from datetime import datetime

ALLOWED_GENRES = [
    "Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction",
    "Fantasy", "Horror", "Biography", "History", "Poetry", "Adventure",
    "Thriller", "Self-Help"
]

# ---------------------------
# Схемы для книг
# ---------------------------
class BookCreate(BaseModel):
    title: str
    authors: str
    description: Optional[str] = None
    genres: List[str]

    @validator("genres", pre=True)
    def split_genres(cls, v):
        # Если значение уже список...
        if isinstance(v, list):
            # Если список состоит из одного элемента, содержащего запятую, разбиваем его
            if len(v) == 1 and isinstance(v[0], str) and "," in v[0]:
                return [item.strip() for item in v[0].split(",") if item.strip()]
            return v
        # Если значение строка, разбиваем по запятым
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    @validator("genres", each_item=True)
    def validate_genres(cls, v):
        if v not in ALLOWED_GENRES:
            raise ValueError(f"Genre must be one of {ALLOWED_GENRES}")
        return v

class BookUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    description: Optional[str] = None
    genres: Optional[List[str]] = None

    @validator("genres", pre=True, always=True)
    def split_genres(cls, v):
        if v is None:
            return v
        if isinstance(v, list):
            if len(v) == 1 and isinstance(v[0], str) and "," in v[0]:
                return [item.strip() for item in v[0].split(",") if item.strip()]
            return v
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    @validator("genres", each_item=True)
    def validate_genres(cls, v):
        if v not in ALLOWED_GENRES:
            raise ValueError(f"Genre must be one of {ALLOWED_GENRES}")
        return v

class BookOut(BaseModel):
    id: int
    title: str
    authors: str
    description: Optional[str] = None
    genres: List[str]
    pdf_id: Optional[str] = None
    created_at: datetime

    @validator("genres", pre=True)
    def split_genres(cls, v: any) -> List[str]:
        if isinstance(v, str):
            cleaned = v.strip('{}')
            return [s.strip() for s in cleaned.split(',') if s.strip()]
        return v

    class Config:
        orm_mode = True # можно заменить на from_attributes = True

# ---------------------------
# Схемы для пользователей
# ---------------------------
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    # Если хотите, чтобы пользователь вводил пароль, добавьте поле password

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
    password: str  # Или, если вход через код, переименуйте это поле в code

class Token(BaseModel):
    access_token: str
    token_type: str
