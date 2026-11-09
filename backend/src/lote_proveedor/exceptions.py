from src.exceptions import BadRequest, NotFound
from src.lote_proveedor.constants import ErrorCode


class LoteProveedorNoEncontrado(NotFound):
    DETAIL = ErrorCode.LOTE_PROVEEDOR_NO_ENCONTRADO


class ProveedorNoExisteOInactivo(BadRequest):
    DETAIL = ErrorCode.PROVEEDOR_NO_EXISTE_O_INACTIVO


class InsumoNoExisteOInactivo(BadRequest):
    DETAIL = ErrorCode.INSUMO_NO_EXISTE_O_INACTIVO


class HabilitacionProveedorVencida(BadRequest):
    DETAIL = ErrorCode.HABILITACION_PROVEEDOR_VENCIDA


class TransicionEstadoInvalida(BadRequest):
    DETAIL = ErrorCode.TRANSICION_ESTADO_INVALIDA


class NumeroLoteDuplicado(BadRequest):
    DETAIL = ErrorCode.NUMERO_LOTE_DUPLICADO


class NumeroRemitoDuplicado(BadRequest):
    DETAIL = ErrorCode.NUMERO_REMITO_DUPLICADO

class ProveedorSinHabilitacion(BadRequest):
    DETAIL = ErrorCode.PROVEEDOR_SIN_HABILITACION