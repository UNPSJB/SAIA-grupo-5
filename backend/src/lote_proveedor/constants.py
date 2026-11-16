from enum import Enum

class EstadoLoteProveedor(str, Enum):
    LLEGADA = "llegada"
    DESEMPAQUE = "desempaque"
    ACOMODADO = "acomodado"

class ErrorCode(str, Enum):
    LOTE_PROVEEDOR_NO_ENCONTRADO = "El lote de proveedor solicitado no existe."
    PROVEEDOR_NO_EXISTE_O_INACTIVO = "El proveedor seleccionado no existe o se encuentra inactivo."
    INSUMO_NO_EXISTE_O_INACTIVO = "El insumo seleccionado no existe o se encuentra inactivo."
    HABILITACION_PROVEEDOR_VENCIDA = "No se puede recibir mercaderia: la habilitacion sanitaria del proveedor esta vencida."
    CANTIDAD_INVALIDA = "La cantidad del lote debe ser mayor a cero."
    FECHA_RECEPCION_FUTURA = "La fecha de recepcion no puede ser futura."
    FECHA_VENCIMIENTO_INVALIDA = "La fecha de vencimiento no puede ser anterior a la de recepcion."
    TRANSICION_ESTADO_INVALIDA = "No se puede avanzar a esa etapa desde el estado actual."
    NUMERO_LOTE_DUPLICADO = "Ya existe un lote registrado con ese numero para este proveedor."
    NUMERO_REMITO_DUPLICADO = "Ya existe un remito registrado con ese numero para este proveedor."
    PROVEEDOR_SIN_HABILITACION = "No se puede recibir mercaderia: el proveedor no posee una habilitacion sanitaria registrada."
    LOTE_SIN_INSUMOS_PARA_ACOMODAR = "No se puede acomodar el lote: debe registrar al menos un insumo recibido."
    PEDIDO_NO_VALIDO = "El pedido seleccionado no existe, esta inactivo, ya fue recibido o no pertenece al proveedor."