from src.registrosCalibracion.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class RegistroCalibracionNoEncontrado(NotFound):
    DETAIL = ErrorCode.REGISTRO_CALIBRACION_NO_ENCONTRADO


class FechaRegistroCalibracionInvalida(BadRequest):
    DETAIL = ErrorCode.FECHA_REGISTRO_CALIBRACION_INVALIDA