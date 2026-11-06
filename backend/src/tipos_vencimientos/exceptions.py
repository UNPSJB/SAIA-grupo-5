from src.tipos_vencimientos.constants import ErrorCode
from src.exceptions import NotFound, BadRequest

class TipoVencimientoNoEncontrado(NotFound):
    DETAIL = ErrorCode.TIPO_VENCIMIENTO_NO_ENCONTRADO

class TipoVencimientoDuplicado(BadRequest):
    DETAIL = ErrorCode.TIPO_VENCIMIENTO_DUPLICADO

class TipoVencimientoEnUso(BadRequest):
    DETAIL = ErrorCode.TIPO_VENCIMIENTO_USADO