from fastapi import APIRouter
from sqlalchemy import select, func
from app.database import database
from app.models import books

router = APIRouter()

@router.get("/")
async def get_statistics():
    """
    Статистика по книгам:
    - Количество книг по жанрам (для pie chart)
    - Количество книг по месяцам (для line chart) на основе created_at
    - Топ-авторы (по количеству книг)
    """
    # Книги по жанрам (используем синтаксис select(…))
    query_genre = select(books.c.genre, func.count().label("count")).group_by(books.c.genre)
    genre_stats = await database.fetch_all(query_genre)
    genre_data = [{"genre": row["genre"], "count": row["count"]} for row in genre_stats]

    # Книги по месяцам
    query_month = select(
        func.to_char(books.c.created_at, 'YYYY-MM').label("month"),
        func.count().label("count")
    ).group_by("month").order_by("month")
    month_stats = await database.fetch_all(query_month)
    month_data = [{"month": row["month"], "count": row["count"]} for row in month_stats]

    # Топ-авторы
    query_authors = select(books.c.authors, func.count().label("count")) \
        .group_by(books.c.authors) \
        .order_by(func.count().desc()) \
        .limit(10)
    author_stats = await database.fetch_all(query_authors)
    author_data = [{"authors": row["authors"], "count": row["count"]} for row in author_stats]

    return {
        "books_by_genre": genre_data,
        "books_by_month": month_data,
        "top_authors": author_data
    }
