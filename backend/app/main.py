from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import database, metadata, engine
from app.routes import books, auth, favorites, statistics

metadata.create_all(engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"], # Для разработки; в продакшене ограничьте домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

app.include_router(books.router, prefix="/books", tags=["books"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
app.include_router(statistics.router, prefix="/statistics", tags=["statistics"])
