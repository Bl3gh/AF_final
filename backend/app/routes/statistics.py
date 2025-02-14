from fastapi import APIRouter, HTTPException
from sqlalchemy import select, func
from app.database import database
from app.models import books

router = APIRouter()

def clean_genre_string(genre_val) -> str:
    # Если значение – список, и все элементы – отдельные символы, объединяем их в строку
    if isinstance(genre_val, list):
        if all(isinstance(el, str) and len(el) == 1 for el in genre_val):
            joined = ''.join(genre_val)
            return clean_genre_string(joined)
        else:
            return ", ".join(genre_val)
    elif isinstance(genre_val, str):
        s = genre_val.strip()
        # Если строка окружена фигурными скобками, удаляем их
        if s.startswith("{") and s.endswith("}"):
            s = s[1:-1]
        # Если встречаются двойные запятые, считаем их разделителем жанров,
        # иначе делим по одной запятой
        if ",," in s:
            parts = s.split(",,")
        else:
            parts = s.split(",")
        # Убираем лишние пробелы из каждой части
        cleaned = [part.strip() for part in parts if part.strip()]
        # Объединяем жанры через запятую с пробелом
        return ", ".join(cleaned)
    else:
        return str(genre_val)


@router.get("/")
async def get_statistics():
    """
    Статистика по книгам:
    - Количество книг по жанрам (для pie chart)
    - Количество книг по месяцам (для line chart) на основе created_at
    - Топ-авторы (по количеству книг)
    """
    # Книги по жанрам
    query_genre = select(books.c.genres, func.count().label("count")).group_by(books.c.genres)
    genre_stats = await database.fetch_all(query_genre)
    genre_data = [
        {"genre": clean_genre_string(dict(row)["genres"]), "count": dict(row)["count"]}
        for row in genre_stats
    ]

    # Книги по месяцам
    query_month = select(
        func.to_char(books.c.created_at, 'YYYY-MM').label("month"),
        func.count().label("count")
    ).group_by("month").order_by("month")
    month_stats = await database.fetch_all(query_month)
    month_data = [
        {"month": dict(row)["month"], "count": dict(row)["count"]}
        for row in month_stats
    ]

    # Топ-авторы
    query_authors = select(books.c.authors, func.count().label("count")) \
        .group_by(books.c.authors) \
        .order_by(func.count().desc()) \
        .limit(10)
    author_stats = await database.fetch_all(query_authors)
    author_data = [
        {"authors": dict(row)["authors"], "count": dict(row)["count"]}
        for row in author_stats
    ]

    return {
        "books_by_genre": genre_data,
        "books_by_month": month_data,
        "top_authors": author_data
    }
