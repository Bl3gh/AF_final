from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import database
from app.models import users
from app.schemas import UserOut
from app.core.security import get_password_hash
from datetime import datetime
from app.core.security import get_current_user


router = APIRouter()

@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Возвращает информацию о текущем пользователе.
    """
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "registration_date": current_user["registration_date"],
    }

@router.get("/auth/check-email")
async def check_email(email: str):
    """
    Проверка существования email в базе данных.
    """
    query = users.select().where(users.c.email == email)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    return {"detail": "Email is available"}



@router.get("/", response_model=list[UserOut])
async def get_all_users():
    """
    Получить список всех пользователей.
    (Можно ограничить доступ только для администраторов).
    """
    query = users.select()
    result = await database.fetch_all(query)
    return result


@router.get("/{user_id}", response_model=UserOut)
async def get_user_by_id(user_id: int):
    """
    Получить данные пользователя по ID.
    """
    query = users.select().where(users.c.id == user_id)
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserOut)
async def update_user(user_id: int, name: str, password: str):
    """
    Обновить данные пользователя (например, имя или пароль).
    """
    hashed_password = get_password_hash(password)
    query = users.update().where(users.c.id == user_id).values(
        name=name,
        hashed_password=hashed_password,
        updated_at=datetime.utcnow()
    )
    await database.execute(query)
    return await get_user_by_id(user_id)


@router.delete("/{user_id}")
async def delete_user(user_id: int):
    """
    Удалить пользователя по ID.
    """
    query = users.delete().where(users.c.id == user_id)
    await database.execute(query)
    return {"message": f"User {user_id} has been deleted"}
