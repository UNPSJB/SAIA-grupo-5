from src.paso_etapa.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class PasoNoEncontrado(NotFound):
    DETAIL = ErrorCode.PASO_NO_ENCONTRADO


class PasoUnico(BadRequest):
    DETAIL = ErrorCode.PASO_UNICO
