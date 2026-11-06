from src.recambiosElementosLimpieza.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class RecambioElementoLimpiezaNoEncontrado(NotFound):
    DETAIL = ErrorCode.RECAMBIO_NO_ENCONTRADO

class FechaRecambioInvalida(BadRequest):
    DETAIL = ErrorCode.FECHA_RECAMBIO_INVALIDA