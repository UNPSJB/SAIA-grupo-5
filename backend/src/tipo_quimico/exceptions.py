from src.exceptions import NotFound, BadRequest
from src.tipo_quimico.constants import ErrorCode

class TipoQuimicoNoEncontrado(NotFound):
    DETAIL = ErrorCode.TIPO_QUIMICO_NO_ENCONTRADO

class TipoQuimicoDuplicado(BadRequest):
    DETAIL = ErrorCode.TIPO_QUIMICO_DUPLICADO

class TipoQuimicoUtilizado(BadRequest):
    DETAIL = ErrorCode.TIPO_QUIMICO_UTILIZADO