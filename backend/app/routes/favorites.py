from fastapi import APIRouter, HTTPException, Query
from typing import List
from sqlalchemy import insert, select, delete as sql_delete

from app.database import database
from app.models import favorites, books
from app.schemas import BookOut

router = APIRouter()

@router.post("/", response_model=dict)
async def add_favorite(user_id: int, book_id: int):
    # Проверяем, существует ли книга
    row = await database.fetch_one(select(books.c.id).where(books.c.id == book_id))
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")
    query = insert(favorites).values(user_id=user_id, book_id=book_id)
    try:
        await database.execute(query)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Favorite already exists or error")
    return {"status": "ok", "message": "Book added to favorites"}

@router.get("/", response_model=List[BookOut])
async def get_favorites(user_id: int = Query(...)):
    query = (
        select(books)
        .select_from(favorites.join(books, favorites.c.book_id == books.c.id))
        .where(favorites.c.user_id == user_id)
    )
    rows = await database.fetch_all(query)
    return [BookOut(**dict(row)) for row in rows]

@router.delete("/")
async def remove_favorite(user_id: int, book_id: int):
    query = sql_delete(favorites).where(
        favorites.c.user_id == user_id,
        favorites.c.book_id == book_id
    )
    await database.execute(query)
    return {"status": "ok", "message": "Favorite removed"}
