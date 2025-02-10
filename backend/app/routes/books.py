import base64
from io import BytesIO
from typing import List, Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import StreamingResponse
from bson.objectid import InvalidId
from sqlalchemy import insert, select, update, delete as sql_delete

from app.database import database
from app.models import books
from app.mongodb import save_pdf, get_pdf, delete_pdf
from app.schemas import BookCreate, BookOut, BookUpdate

router = APIRouter()

# Создание книги
@router.post("/", response_model=BookOut)
async def create_book(
    book_data: BookCreate = Depends(),  # JSON с полями title, authors, description, genre
    pdf_file: UploadFile = File(...)
):
    pdf_id = await save_pdf(pdf_file)
    query = (
        insert(books)
        .values(
            title=book_data.title,
            authors=book_data.authors,
            description=book_data.description,
            genre=book_data.genre,
            pdf_id=pdf_id
        )
        .returning(books.c.id)
    )
    book_id = await database.execute(query)
    row = await database.fetch_one(select(books).where(books.c.id == book_id))
    return BookOut(**dict(row))

# Получение списка книг
@router.get("/", response_model=List[BookOut])
async def list_books():
    rows = await database.fetch_all(select(books))
    return [BookOut(**dict(row)) for row in rows]

# Получение одной книги (метаданные)
@router.get("/{book_id}", response_model=BookOut)
async def get_book(book_id: int):
    row = await database.fetch_one(select(books).where(books.c.id == book_id))
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")
    return BookOut(**dict(row))

# Скачивание PDF
@router.get("/{book_id}/pdf")
async def download_pdf(book_id: int):
    row = await database.fetch_one(select(books.c.pdf_id).where(books.c.id == book_id))
    if not row or not row["pdf_id"]:
        raise HTTPException(status_code=404, detail="PDF not found")
    pdf_id = row["pdf_id"]
    try:
        pdf_data = await get_pdf(pdf_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid PDF ID")
    return StreamingResponse(
        BytesIO(pdf_data),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=book_{book_id}.pdf"}
    )

# Получение книги с PDF (Base64)
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
        except InvalidId:
            pass
    return {
        "id": row["id"],
        "title": row["title"],
        "authors": row["authors"],
        "description": row["description"],
        "genre": row["genre"],
        "pdf_base64": pdf_base64,
        "created_at": row["created_at"].isoformat() if row["created_at"] else None
    }

# Обновление книги («умное» обновление)
@router.put("/{book_id}", response_model=BookOut)
async def update_book(
    book_id: int,
    title: Optional[str] = Form(None),
    authors: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    genre: Optional[str] = Form(None),
    new_pdf: UploadFile = File(None)
):
    row = await database.fetch_one(select(books).where(books.c.id == book_id))
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")
    old_title = row["title"]
    old_authors = row["authors"]
    old_description = row["description"]
    old_genre = row["genre"]
    old_pdf_id = row["pdf_id"]

    def keep_old(new_val: Optional[str], old_val: str) -> str:
        if new_val is None or new_val.strip() == "":
            return old_val
        return new_val

    new_title = keep_old(title, old_title)
    new_authors = keep_old(authors, old_authors)
    new_description = keep_old(description, old_description)
    new_genre = keep_old(genre, old_genre) if genre is not None else old_genre

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
        new_genre != old_genre or
        replaced_pdf
    )
    if not changed:
        return BookOut(**dict(row))

    updated_values = {
        "title": new_title,
        "authors": new_authors,
        "description": new_description,
        "genre": new_genre,
        "pdf_id": pdf_id
    }
    query = update(books).where(books.c.id == book_id).values(**updated_values).returning(*books.c)
    new_row = await database.fetch_one(query)
    return BookOut(**dict(new_row))

# Удаление книги
@router.delete("/{book_id}")
async def delete_book(book_id: int):
    # Получаем запись книги
    row = await database.fetch_one(select(books).where(books.c.id == book_id))
    if not row:
        raise HTTPException(status_code=404, detail="Book not found")
    # Если есть PDF, удаляем его из MongoDB
    if row["pdf_id"]:
        await delete_pdf(row["pdf_id"])
    # Удаляем запись из PostgreSQL
    query = sql_delete(books).where(books.c.id == book_id)
    await database.execute(query)
    return {"status": "ok", "detail": f"Book with id {book_id} has been deleted"}
