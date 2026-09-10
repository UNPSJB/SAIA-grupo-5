from src.insumos.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class InsumoNoEncontrado(NotFound):
    DETAIL = ErrorCode.INSUMO_NO_ENCONTRADO


class InsumoDuplicado(BadRequest):
    DETAIL = ErrorCode.INSUMO_DUPLICADO
