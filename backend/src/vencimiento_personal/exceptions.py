from src.vencimiento_personal.constants import ErrorCode
from src.exceptions import NotFound, BadRequest

class VencimientoNoEncontrado(NotFound):
    DETAIL = ErrorCode.VENCIMIENTO_NO_ENCONTRADO

class FechasVencimientoInvalidas(BadRequest):
    DETAIL = ErrorCode.FECHAS_INVALIDAS

class TipoVencimientoInactivo(BadRequest):
    DETAIL = ErrorCode.TIPO_VENCIMIENTO_INACTIVO

class VencimientoDuplicado(BadRequest):
    DETAIL = ErrorCode.VENCIMIENTO_DUPLICADO