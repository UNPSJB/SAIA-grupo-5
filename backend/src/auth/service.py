import jwt
import datetime
from sqlalchemy.orm import Session
from src.auth.utils import check_passwords_match
from src.auth import exceptions
from src.personal import services as personal_services
from src.personal import models as personal_models


def authenticate_user(username: str, password: str, db: Session) -> personal_models.Persona:
    try:
        persona = personal_services.leer_persona_por_username(db, username)
    except Exception:
        raise exceptions.IncorrectUserOrPassword()

    if not persona.activo:
        raise exceptions.IncorrectUserOrPassword()

    check_passwords_match(password, persona.hashed_password)
    return persona
