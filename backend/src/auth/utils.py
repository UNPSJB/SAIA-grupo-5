import jwt
import datetime
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Optional
from src.settings import (
    REFRESH_SECRET_KEY,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
)
from src.auth import exceptions
from src.personal import models as personal_models
from src.personal import schemas as personal_schemas

password_hash = PasswordHash.recommended()


def check_passwords_match(password: str, hashed_password: str) -> None:
    if not verify_password(password, hashed_password):
        raise exceptions.IncorrectUserOrPassword()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return password_hash.hash(password)


def encode_token(
    data: dict, expires_delta_minutes: Optional[int] = 15, key: str = SECRET_KEY
) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
        minutes=expires_delta_minutes
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, key, algorithm=ALGORITHM)
    return encoded_jwt


def create_access_token(
    persona: personal_models.Persona, expiration_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES
) -> str:
    serialized_persona = personal_schemas.Persona.model_validate(persona).model_dump_json()
    access_token = encode_token(
        data={"sub": serialized_persona},
        expires_delta_minutes=expiration_minutes,
    )
    return access_token


async def create_refresh_token(db: Session, persona_id: int) -> str:
    persona = db.scalar(
        select(personal_models.Persona).where(personal_models.Persona.id == persona_id)
    )
    expiration_minutes = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60
    serialized_persona = personal_schemas.Persona.model_validate(persona).model_dump_json()
    refresh_token = encode_token(
        data={"sub": serialized_persona},
        expires_delta_minutes=expiration_minutes,
        key=REFRESH_SECRET_KEY,
    )
    return refresh_token


def _is_valid_refresh_token(expires_at: datetime.datetime) -> bool:
    return datetime.datetime.now(datetime.timezone.utc) <= expires_at.astimezone(
        datetime.timezone.utc
    )
