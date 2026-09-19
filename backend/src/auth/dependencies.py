import jwt
from datetime import datetime, timezone
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jwt.exceptions import (
    InvalidTokenError,
    ExpiredSignatureError,
)
from src.database import get_db
from src.settings import (
    REFRESH_SECRET_KEY,
    REFRESH_TOKEN_COOKIE_NAME,
    TOKEN_URL,
    SECRET_KEY,
    ALGORITHM,
)
from src.auth.schemas import TokenData
from src.auth.utils import _is_valid_refresh_token
from src.auth import exceptions
from src.exceptions import PermissionDenied
from src.personal import services as personal_services
from src.personal import models as personal_models
from src.personal import schemas as personal_schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=TOKEN_URL)


def get_token_from_cookie(request: Request) -> str:
    """
    Obtiene el JWT desde la cookie.
    Si el token no existe, lanza la excepción RefreshTokenNotValid().
    """
    token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not token:
        raise exceptions.RefreshTokenNotValid()
    return token


async def get_refresh_persona(
    db: Session = Depends(get_db),
    token: str = Depends(get_token_from_cookie),
) -> personal_models.Persona:
    """Obtiene la Persona de la base de datos asociada al refresh token."""
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        exp_ts = payload.get("exp")
        if exp_ts is None:
            raise exceptions.RefreshTokenNotValid()
        expires_at = datetime.fromtimestamp(exp_ts, tz=timezone.utc)
        if not _is_valid_refresh_token(expires_at):
            raise exceptions.RefreshTokenNotValid()

        user_str = payload.get("sub")
        if user_str is None:
            raise exceptions.InvalidCredentials()

        persona_data = personal_schemas.Persona.model_validate_json(user_str)
        token_data = TokenData(username=persona_data.username)
    except InvalidTokenError:
        raise exceptions.RefreshTokenNotValid()

    try:
        persona = personal_services.leer_persona_por_username(db, username=token_data.username)
    except Exception:
        raise exceptions.InvalidCredentials()

    if not persona.activo:
        raise exceptions.InvalidCredentials()

    return persona


async def get_current_persona(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> personal_models.Persona:
    """Obtiene la Persona de la base de datos asociada al access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_str = payload.get("sub")
        if user_str is None:
            raise exceptions.InvalidCredentials()
        persona_data = personal_schemas.Persona.model_validate_json(user_str)
        token_data = TokenData(username=persona_data.username)
    except ExpiredSignatureError:
        raise exceptions.InvalidCredentials()
    except InvalidTokenError:
        raise exceptions.InvalidCredentials()

    try:
        persona = personal_services.leer_persona_por_username(db, username=token_data.username)
    except Exception:
        raise exceptions.InvalidCredentials()

    if not persona.activo:
        raise exceptions.InvalidCredentials()

    return persona


# Alias para compatibilidad con convenciones de fastapi-auth-ds
get_current_user = get_current_persona


async def tiene_permiso_administrar(
    persona: personal_models.Persona = Depends(get_current_persona),
) -> personal_models.Persona:
    """Verifica que la persona autenticada tenga capacidad de administrar."""
    if not persona.administrar:
        raise PermissionDenied()
    return persona


async def tiene_permiso_operar(
    persona: personal_models.Persona = Depends(get_current_persona),
) -> personal_models.Persona:
    """Verifica que la persona autenticada tenga capacidad de operar."""
    if not persona.operar:
        raise PermissionDenied()
    return persona
