from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
import jwt
from typing import Optional

SECRET_KEY = "61T1OeneuKWiq20JrCp7DPt8WArl1ywtfxLdMFwiDc"  # Должен совпадать с auth.py
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Извлекает и декодирует JWT-токен из заголовка Authorization: Bearer <token>.
    Возвращает словарь с payload. Предполагается, что sub = user_id.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no sub",
                headers={"WWW-Authenticate": "Bearer"}
            )
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
def get_is_admin(current_user: dict = Depends(get_current_user)) -> bool:
    """
    Возвращает True, если роль пользователя (из токена) равна "Admin" (без учета регистра),
    иначе возвращает False.
    """
    return current_user.get("role", "").lower() == "admin"