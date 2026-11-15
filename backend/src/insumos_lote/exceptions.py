from src.exceptions import NotFound, BadRequest
from src.insumos_lote.constants import ErrorCode


class InsumoLoteNoEncontrado(NotFound):
    DETAIL = ErrorCode.INSUMO_LOTE_NO_ENCONTRADO


class LoteProveedorNoEncontrado(NotFound):
    DETAIL = ErrorCode.LOTE_PROVEEDOR_NO_ENCONTRADO


class InsumoNoEncontradoOInactivo(BadRequest):
    DETAIL = ErrorCode.INSUMO_NO_ENCONTRADO_O_INACTIVO

class CantidadInvalida(BadRequest):
    DETAIL = ErrorCode.CANTIDAD_INVALIDA

class FechaVencimientoInvalida(BadRequest):
    DETAIL = ErrorCode.FECHA_VENCIMIENTO_INVALIDA

class InsumoSinStockNoReactivable(BadRequest):
    DETAIL = ErrorCode.INSUMO_SIN_STOCK_NO_REACTIVABLE


class InsumoYaRegistradoEnLote(BadRequest):
    DETAIL = ErrorCode.INSUMO_YA_REGISTRADO_EN_LOTE


class InsumoNoEnPedido(BadRequest):
    DETAIL = ErrorCode.INSUMO_NO_EN_PEDIDO