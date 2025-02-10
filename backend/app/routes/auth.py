from fastapi import APIRouter, HTTPException, Depends, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select, update
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import random
import string
from typing import Optional

from app.database import database
from app.models import users
from app.schemas import UserCreate, UserOut, UserLogin, Token
from app.mailer import send_verification_email

router = APIRouter()

# Остальной код...


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "gH1wR8k9lXP2gPqVuOOJxP2k7wwgU09wOxVO8KU9-NI"  # замените на ваш секретный ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_verification_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Регистрация (только email и name)
@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    # Проверка, существует ли уже пользователь с таким email
    query = select(users).where(users.c.email == user.email)
    existing = await database.fetch_one(query)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Генерируем код для верификации
    verification_code = create_verification_code()
    
    # Сохраняем пользователя (пароль пока не задан, или можно сохранить его как хэш кода)
    query_insert = users.insert().values(
        email=user.email,
        name=user.name,
        hashed_password=get_password_hash(verification_code),  # задаем код как пароль (хэшируем его)
        role="Customer",
        registration_date=datetime.utcnow(),
        is_verified=False,
        verification_code=verification_code
    ).returning(users.c.id)
    user_id = await database.execute(query_insert)
    
    # Отправляем код на почту
    send_verification_email(user.email, verification_code)
    
    created_user = await database.fetch_one(select(users).where(users.c.id == user_id))
    return UserOut(**dict(created_user))

# Верификация аккаунта (ввод кода, полученного на почту)
@router.post("/verify", response_model=UserOut)
async def verify_account(email: str = Form(...), code: str = Form(...)):
    query = select(users).where(users.c.email == email)
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user["verification_code"] != code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
    
    # Обновляем пользователя, устанавливаем is_verified=True и сбрасываем verification_code
    query_update = update(users).where(users.c.id == user["id"]).values(is_verified=True, verification_code=None)
    await database.execute(query_update)
    
    updated_user = await database.fetch_one(select(users).where(users.c.id == user["id"]))
    return UserOut(**dict(updated_user))

# Логин (используем email и код, который был использован как пароль)
@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # В нашем случае, вместо обычного поля password пользователь вводит код, который был отправлен
    query = select(users).where(users.c.email == form_data.username)
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or code")
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or code")
    if not user["is_verified"]:
        raise HTTPException(status_code=400, detail="User is not verified")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "id": user["id"]},
        expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

# Обновление профиля (смена имени и/или пароля)
@router.put("/update_profile", response_model=UserOut)
async def update_profile(
    user_id: int = Form(...),
    name: Optional[str] = Form(None),
    new_password: Optional[str] = Form(None)
):
    # Получаем текущего пользователя
    query = select(users).where(users.c.id == user_id)
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_data = {}
    if name is not None and name.strip() != "":
        updated_data["name"] = name
    if new_password is not None and new_password.strip() != "":
        updated_data["hashed_password"] = get_password_hash(new_password)
    
    if not updated_data:
        return UserOut(**dict(user))
    
    query_update = update(users).where(users.c.id == user_id).values(**updated_data)
    await database.execute(query_update)
    
    updated_user = await database.fetch_one(select(users).where(users.c.id == user_id))
    return UserOut(**dict(updated_user))
