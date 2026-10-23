from src.exceptions import NotFound, BadRequest
from src.unidad_medida.constants import ErrorCode

class UnidadMedidaNoEncontrada(NotFound):
    DETAIL = ErrorCode.UNIDAD_NO_ENCONTRADA

class UnidadMedidaDuplicada(BadRequest):
    DETAIL = ErrorCode.UNIDAD_DUPLICADA

    
class UnidadMedidaDadaDeBaja(BadRequest):
    DETAIL = ErrorCode.UNIDAD_DADA_DE_BAJA