from src.consumo_producto.constants import ErrorCode
from src.exceptions import NotFound, BadRequest

class ConsumoNoEncontrado(NotFound):
    DETAIL = ErrorCode.CONSUMO_NO_ENCONTRADO

class ConsumoDuplicado(BadRequest):
    DETAIL = ErrorCode.CONSUMO_DUPLICADO
