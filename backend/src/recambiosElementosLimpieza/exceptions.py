from src.recambiosElementosLimpieza.constants import ErrorCode
from src.exceptions import NotFound


class RecambioElementoLimpiezaNoEncontrado(NotFound):
    DETAIL = ErrorCode.RECAMBIO_NO_ENCONTRADO