from src.exceptions import NotFound, BadRequest
from src.insumo_quimico.constants import ErrorCode

class InsumoQuimicoNoEncontrado(NotFound):
    DETAIL = ErrorCode.INSUMO_QUIMICO_NO_ENCONTRADO

class InsumoQuimicoDuplicado(BadRequest):
    DETAIL = ErrorCode.INSUMO_QUIMICO_DUPLICADO