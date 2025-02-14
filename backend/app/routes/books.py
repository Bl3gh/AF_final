from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import List, Optional
import base64
from io import BytesIO
from sqlalchemy import insert, select, update, cast, String
from sqlalchemy.dialects import postgresql

from app.database import database
from app.models import books
from app.mongodb import save_pdf, get_pdf, delete_pdf
from app.schemas import BookCreate, BookOut, BookUpdate

router = APIRouter()

# -------------------------------
# 1. Создание книги
# -------------------------------
@router.post("/", response_model=BookOut)
async def create_book(book_data: BookCreate):
    query = (
        insert(books)
        .values(
            title=book_data.title,
            authors=book_data.authors,
            description=book_data.description,
            genres=cast(book_data.genres, postgresql.ARRAY(String))
        )
        .returning(books.c.id)
    )
    book_id = await database.execute(query)
    row = await database.fetch_one(select(books).where(books.c.id == book_id))
    return BookOut(**dict(row))

# 🟢 2️⃣ Отдельная загрузка PDF
@router.post("/{book_id}/upload_pdf")
async def upload_pdf(book_id: int, pdf_file: UploadFile = File(...)):
    row = await database.fetch_one(select(books).where(books.c.id == book_id))
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")

    pdf_id = await save_pdf(pdf_file)
    query = (
        books.update()
        .where(books.c.id == book_id)
        .values(pdf_id=pdf_id)
    )
    await database.execute(query)

    return {"message": "PDF uploaded successfully", "pdf_id": pdf_id}


# -------------------------------
# 2. Поиск книг с фильтрами по названию, жанрам и авторам
# -------------------------------

@router.get("/search", response_model=List[BookOut])
async def search_books(
    title: Optional[str] = Query(None),
    authors: Optional[str] = Query(None),
    # Для жанров можно передать несколько значений, например: ?genres=Fiction&genres=Mystery
    genres: Optional[List[str]] = Query(None)
):
    query = select(books)
    if title:
        query = query.where(books.c.title.ilike(f"%{title}%"))
    if authors:
        query = query.where(books.c.authors.ilike(f"%{authors}%"))
    if genres:
        query = query.where(books.c.genres.overlap(genres))
    rows = await database.fetch_all(query)
    return [BookOut(**dict(row)) for row in rows]

# -------------------------------
# 3. Получение списка всех книг
# -------------------------------
@router.get("/", response_model=List[BookOut])
async def list_books():
    rows = await database.fetch_all(select(books))
    return [BookOut(**dict(row)) for row in rows]

# -------------------------------
# 4. Получение одной книги (метаданные)
# -------------------------------
@router.get("/{book_id}", response_model=BookOut)
async def get_book(book_id: int):
    row = await database.fetch_one(select(books).where(books.c.id == book_id))
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")
    return BookOut(**dict(row))

# -------------------------------
# 5. Скачивание PDF-файла
# -------------------------------
@router.get("/{book_id}/pdf")
async def download_pdf(book_id: int):
    row = await database.fetch_one(select(books.c.pdf_id).where(books.c.id == book_id))
    if not row or not row["pdf_id"]:
        raise HTTPException(status_code=404, detail="PDF not found")
    pdf_id = row["pdf_id"]
    try:
        pdf_data = await get_pdf(pdf_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid PDF ID")
    return StreamingResponse(
        BytesIO(pdf_data),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=book_{book_id}.pdf"}
    )

# -------------------------------
# 6. Получение книги с PDF (Base64)
# -------------------------------
@router.get("/{book_id}/full")
async def get_full_book(book_id: int):
    row = await database.fetch_one(select(books).where(books.c.id == book_id))
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")
    pdf_id = row["pdf_id"]
    pdf_base64 = None
    if pdf_id:
        try:
            pdf_data = await get_pdf(pdf_id)
            pdf_base64 = base64.b64encode(pdf_data).decode("utf-8")
        except Exception:
            pass
    return {
        "id": row["id"],
        "title": row["title"],
        "authors": row["authors"],
        "description": row["description"],
        "genres": row["genres"],
        "pdf_base64": pdf_base64,
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }

# -------------------------------
# 7. Обновление книги (с поддержкой нескольких жанров)
# -------------------------------
@router.put("/{book_id}", response_model=BookOut)
async def update_book(
    book_id: int,
    title: Optional[str] = Form(None),
    authors: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    # Жанры передаются как строка, разделённая запятыми (например, "Fiction, Mystery")
    genres: Optional[str] = Form(None),
    new_pdf: UploadFile = File(None)
):
    row = await database.fetch_one(select(books).where(books.c.id == book_id))
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")
    old_title = row["title"]
    old_authors = row["authors"]
    old_description = row["description"]
    old_genres = row["genres"]  # это список жанров
    old_pdf_id = row["pdf_id"]

    def keep_old(new_val: Optional[str], old_val: str) -> str:
        if new_val is None or new_val.strip() == "":
            return old_val
        return new_val

    new_title = keep_old(title, old_title)
    new_authors = keep_old(authors, old_authors)
    new_description = keep_old(description, old_description)
    if genres is not None and genres.strip() != "":
        new_genres = [g.strip() for g in genres.split(",") if g.strip()]
    else:
        new_genres = old_genres

    pdf_id = old_pdf_id
    replaced_pdf = False
    if new_pdf is not None:
        new_pdf_id = await save_pdf(new_pdf)
        if old_pdf_id:
            await delete_pdf(old_pdf_id)
        pdf_id = new_pdf_id
        replaced_pdf = True

    changed = (
        new_title != old_title or
        new_authors != old_authors or
        new_description != old_description or
        new_genres != old_genres or
        replaced_pdf
    )
    if not changed:
        return BookOut(**dict(row))

    updated_values = {
        "title": new_title,
        "authors": new_authors,
        "description": new_description,
        "genres": cast(new_genres, postgresql.ARRAY(String)),
        "pdf_id": pdf_id
    }
    query = update(books).where(books.c.id == book_id).values(**updated_values).returning(*books.c)
    new_row = await database.fetch_one(query)
    return BookOut(**dict(new_row))

