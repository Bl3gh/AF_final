# app/schemas.py

from pydantic import BaseModel, EmailStr, constr, validator
from typing import Optional, List
from datetime import datetime

class TokenPayload(BaseModel):
    token: str


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
        # Если v - список и все элементы – однобуквенные строки,
        # то, скорее всего, он пришёл как список отдельных символов.
        if isinstance(v, list):
            if all(isinstance(item, str) and len(item) == 1 for item in v):
                # Собираем строку и разбиваем её по запятым
                v = "".join(v)
            else:
                # Если список уже корректный – возвращаем его как есть
                return v
        if isinstance(v, str):
            # Убираем фигурные скобки, если они есть
            cleaned = v.strip('{}')
            # Разбиваем строку по запятым и удаляем лишние пробелы
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

class UserProfile(BaseModel):
    id: int
    email: str
    name: str
    role: str
    # Дополнительно, если нужно:
    # registration_date: datetime
    favorites: List["BookOut"]  # список книг

    # Если используете Pydantic v2, замените orm_mode на from_attributes
    class Config:
        orm_mode = True

class UpdateProfileRequest(BaseModel):
    token: str
    name: Optional[str] = None
    new_password: Optional[str] = None
