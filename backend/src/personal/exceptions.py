from fastapi import HTTPException, status
from src.personal.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class PersonaNoEncontrada(NotFound):
    DETAIL = ErrorCode.PERSONA_NO_ENCONTRADA


class PersonaDadaDeBaja(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pueden editar las capacidades de una persona dada de baja.",
        )


class UsernameExistente(BadRequest):
    DETAIL = ErrorCode.USERNAME_EXISTENTE


class DniExistente(BadRequest):
    DETAIL = ErrorCode.DNI_EXISTENTE


class MailExistente(BadRequest):
    DETAIL = ErrorCode.MAIL_EXISTENTE


class DebeTenerCapacidad(BadRequest):
    DETAIL = ErrorCode.DEBE_TENER_CAPACIDAD
