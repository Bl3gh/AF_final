import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from fastapi import UploadFile
from bson.objectid import ObjectId

MONGO_URL = "mongodb://localhost:27017"
MONGO_DB_NAME = "onlinelib"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB_NAME]

# GridFS для хранения PDF
grid_fs = AsyncIOMotorGridFSBucket(db, bucket_name="books_pdfs")

async def save_pdf(file: UploadFile) -> str:
    """
    Сохраняет PDF в GridFS и возвращает его ObjectId в виде строки.
    open_upload_stream вызывается без await.
    """
    file_data = await file.read()
    filename = file.filename or "uploaded.pdf"
    grid_in = grid_fs.open_upload_stream(filename)  # без await
    await grid_in.write(file_data)
    await grid_in.close()
    return str(grid_in._id)

async def get_pdf(pdf_id: str) -> bytes:
    """
    Получает PDF из GridFS по ID.
    open_download_stream вызывается с await.
    """
    fs_id = ObjectId(pdf_id)
    grid_out = await grid_fs.open_download_stream(fs_id)  # с await
    file_data = b""
    async for chunk in grid_out:
        file_data += chunk
    return file_data

async def delete_pdf(pdf_id: str) -> None:
    """
    Удаляет PDF по ID.
    """
    fs_id = ObjectId(pdf_id)
    await grid_fs.delete(fs_id)
