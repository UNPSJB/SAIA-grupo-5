from src.exceptions import BadRequest, NotFound
from src.pedidos_proveedor.constants import ErrorCode


class PedidoProveedorNoEncontrado(NotFound):
    DETAIL = ErrorCode.PEDIDO_PROVEEDOR_NO_ENCONTRADO


class ProveedorNoExisteOInactivo(BadRequest):
    DETAIL = ErrorCode.PROVEEDOR_NO_EXISTE_O_INACTIVO


class ProveedorSinHabilitacion(BadRequest):
    DETAIL = ErrorCode.PROVEEDOR_SIN_HABILITACION


class HabilitacionProveedorVencida(BadRequest):
    DETAIL = ErrorCode.HABILITACION_PROVEEDOR_VENCIDA


class PedidoSinInsumos(BadRequest):
    DETAIL = ErrorCode.PEDIDO_SIN_INSUMOS


class InsumosRepetidos(BadRequest):
    DETAIL = ErrorCode.INSUMOS_REPETIDOS


class InsumoNoPerteneceAProveedor(BadRequest):
    DETAIL = ErrorCode.INSUMO_NO_PERTENECE_A_PROVEEDOR


class PedidoNoEditable(BadRequest):
    DETAIL = ErrorCode.PEDIDO_NO_EDITABLE