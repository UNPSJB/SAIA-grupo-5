from enum import Enum


class EstadoPedidoProveedor(str, Enum):
    PENDIENTE = "pendiente"
    RECIBIDO = "recibido"


class ErrorCode(str, Enum):
    PEDIDO_PROVEEDOR_NO_ENCONTRADO = "El pedido a proveedor solicitado no existe."
    PROVEEDOR_NO_EXISTE_O_INACTIVO = "El proveedor seleccionado no existe o se encuentra inactivo."
    PROVEEDOR_SIN_HABILITACION = "No se puede realizar un pedido: el proveedor no posee una habilitacion sanitaria registrada."
    HABILITACION_PROVEEDOR_VENCIDA = "No se puede realizar un pedido: la habilitacion sanitaria del proveedor esta vencida."
    PEDIDO_SIN_INSUMOS = "El pedido debe contener al menos un insumo."
    INSUMOS_REPETIDOS = "No se puede pedir dos veces el mismo insumo en un mismo pedido."
    INSUMO_NO_PERTENECE_A_PROVEEDOR = "Uno o mas insumos seleccionados no pertenecen al catalogo de este proveedor o estan dados de baja."
    PEDIDO_NO_EDITABLE = "Solo se pueden editar o dar de baja pedidos activos en estado pendiente."