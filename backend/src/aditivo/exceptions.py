from src.exceptions import NotFound, BadRequest
from src.aditivo.constants import ErrorCode


class AditivoNoEncontrado(NotFound):
    DETAIL = ErrorCode.ADITIVO_NO_ENCONTRADO


class AditivoDuplicado(BadRequest):
    DETAIL = ErrorCode.ADITIVO_DUPLICADO


class NumeroInsDuplicado(BadRequest):
    DETAIL = ErrorCode.NUMERO_INS_DUPLICADO
