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