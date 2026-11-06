from src.tarea.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class TareaNoEncontrada(NotFound):
    DETAIL = ErrorCode.TAREA_NO_ENCONTRADA


class TareaDatosInvalidos(BadRequest):
    DETAIL = ErrorCode.TAREA_DATOS_INVALIDOS
