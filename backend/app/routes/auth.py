from datetime import datetime, timedelta
from typing import Optional

import jwt
import random
import string
from fastapi import APIRouter, HTTPException, Depends, Form
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from sqlalchemy import select, update
from fastapi import Body

from app.database import database
from app.models import users, favorites, books
from app.schemas import UserCreate, UserOut, Token, UserProfile, BookOut
from app.schemas import TokenPayload, UpdateProfileRequest  # Импортируем модель
from app.mailer import send_verification_email
from app.dependencies import get_current_user, get_is_admin   # Зависимость, которая декодирует токен

router = APIRouter()

# ---- Конфигурация безопасности ----
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "61T1OeneuKWiq20JrCp7DPt8WArl1ywtfxLdMFwiDc"  # Замените на более безопасное значение (или берите из окружения)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ---- Вспомогательные функции ----

def create_verification_code(length: int = 6) -> str:
    """Генерирует случайный код (например, 6 цифр) для верификации."""
    return ''.join(random.choices(string.digits, k=length))

def get_password_hash(password: str) -> str:
    """Хэширует пароль с помощью bcrypt (passlib)."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Сравнивает обычный пароль с хэшированным."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Создаёт JWT-токен. 
    Включаем 'sub' как user_id, а также любые другие поля (login, role).
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "sub": str(data["user_id"])})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ---- Эндпоинты ----

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    """
    Регистрация пользователя. Пользователь вводит email и имя.
    Генерируется код (верификационный), сохраняется в hashed_password (пока), отправляется на email.
    """
    # Проверяем, есть ли уже пользователь с таким email
    query = select(users).where(users.c.email == user.email)
    existing = await database.fetch_one(query)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    verification_code = create_verification_code()
    hashed_password = get_password_hash(verification_code)
    
    query_insert = users.insert().values(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        role="Customer",
        registration_date=datetime.utcnow(),
        is_verified=False,
        verification_code=verification_code
    ).returning(users.c.id)
    user_id = await database.execute(query_insert)
    
    # Отправляем код по почте
    send_verification_email(user.email, verification_code)
    
    created_user = await database.fetch_one(select(users).where(users.c.id == user_id))
    return UserOut(**dict(created_user))

@router.post("/verify", response_model=UserOut)
async def verify_account(email: str = Form(...), code: str = Form(...)):
    """
    Верификация аккаунта (email + код). Если совпадает, is_verified=True.
    """
    query = select(users).where(users.c.email == email)
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user["verification_code"] != code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    query_update = update(users).where(users.c.id == user["id"]).values(is_verified=True, verification_code=None)
    await database.execute(query_update)
    
    updated_user = await database.fetch_one(select(users).where(users.c.id == user["id"]))
    return UserOut(**dict(updated_user))

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Логин через поля username (email) и password (верификационный код или новый пароль).
    Возвращаем JWT-токен, содержащий user_id, login (email), role.
    """
    query = select(users).where(users.c.email == form_data.username)
    user = await database.fetch_one(query)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or code")
    if not user["is_verified"]:
        raise HTTPException(status_code=400, detail="User not verified")
    
    token_data = {
        "user_id": user["id"],
        "login": user["email"],
        "role": user["role"]
    }
    access_token = create_access_token(token_data)
    return Token(access_token=access_token, token_type="bearer")

@router.put("/update_profile", response_model=UserOut)
async def update_profile(payload: UpdateProfileRequest = Body(...)):
    """
    Обновление профиля.
    Запрос принимает тело с полями:
      - token: строка JWT,
      - name: новое имя (опционально),
      - new_password: новый пароль (опционально).
    Из токена извлекается user_id, и затем обновляются данные.
    """
    token = payload.token
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(decoded.get("sub"))
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    query = select(users).where(users.c.id == user_id)
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_data = {}
    if payload.name is not None and payload.name.strip():
        updated_data["name"] = payload.name
    if payload.new_password is not None and payload.new_password.strip():
        updated_data["hashed_password"] = get_password_hash(payload.new_password)
    
    if not updated_data:
        return UserOut(**dict(user))
    
    query_update = update(users).where(users.c.id == user_id).values(**updated_data)
    await database.execute(query_update)
    
    updated_user = await database.fetch_one(select(users).where(users.c.id == user_id))
    return UserOut(**dict(updated_user))

@router.post("/profile", response_model=UserOut)
async def get_profile(payload: TokenPayload):
    token = payload.token
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(decoded.get("sub"))
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    query = select(users).where(users.c.id == user_id)
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserOut(**dict(user))

@router.get("/admin-data")
async def get_admin_data(is_admin: bool = Depends(get_is_admin)):
    if not is_admin:
        raise HTTPException(status_code=403, detail="Not enough privileges: Admins only")
    return {"message": "This is admin-only data."}