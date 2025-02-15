from fastapi import APIRouter, HTTPException, Body
from sqlalchemy import select, delete as sql_delete, insert
from typing import List
import jwt
from pydantic import BaseModel

from app.database import database
from app.models import favorites, books
from app.schemas import BookOut

# Определите Pydantic модель для ответа с сообщением
class Message(BaseModel):
    status: str
    message: str

# Убедитесь, что SECRET_KEY и ALGORITHM совпадают с настройками в auth.py
SECRET_KEY = "61T1OeneuKWiq20JrCp7DPt8WArl1ywtfxLdMFwiDc"
ALGORITHM = "HS256"

router = APIRouter()

@router.post("/add", response_model=Message)
async def add_favorite(payload: dict = Body(...)):
    """
    Добавляет книгу в избранное.
    Ожидает JSON с полями:
      - token: JWT-токен
      - book_id: ID книги
    """
    token = payload.get("token")
    book_id = payload.get("book_id")
    if not token or not book_id:
        raise HTTPException(status_code=422, detail="Token and book_id are required")
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(decoded.get("sub"))
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Проверяем, существует ли книга
    row = await database.fetch_one(select(books.c.id).where(books.c.id == book_id))
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")
    
    query = insert(favorites).values(user_id=user_id, book_id=book_id)
    try:
        await database.execute(query)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Favorite already exists or error")
    
    return Message(status="ok", message="Book added to favorites")

@router.post("/profile", response_model=List[BookOut])
async def get_favorites_profile(payload: dict = Body(...)):
    """
    Получает список избранных книг для текущего пользователя.
    Ожидает JSON с полем:
      - token: JWT-токен
    """
    token = payload.get("token")
    if not token:
        raise HTTPException(status_code=422, detail="Token is required")
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(decoded.get("sub"))
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    query = (
        select(books)
        .select_from(favorites.join(books, favorites.c.book_id == books.c.id))
        .where(favorites.c.user_id == user_id)
    )
    rows = await database.fetch_all(query)
    return [BookOut(**dict(row)) for row in rows]

@router.delete("/remove", response_model=Message)
async def remove_favorite(payload: dict = Body(...)):
    """
    Удаляет книгу из избранного.
    Ожидает JSON с полями:
      - token: JWT-токен
      - book_id: ID книги
    """
    token = payload.get("token")
    book_id = payload.get("book_id")
    if not token or not book_id:
        raise HTTPException(status_code=422, detail="Token and book_id are required")
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(decoded.get("sub"))
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    query = sql_delete(favorites).where(
        favorites.c.user_id == user_id,
        favorites.c.book_id == book_id
    )
    await database.execute(query)
    return Message(status="ok", message="Favorite removed")
