from src.personal.constants import ErrorCode
from src.exceptions import NotFound


class PersonaNoEncontrada(NotFound):
    DETAIL = ErrorCode.PERSONA_NO_ENCONTRADA
