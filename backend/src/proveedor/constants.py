from enum import Enum


class EstadoVencimientoHabilitacion(str, Enum):
    VIGENTE = "vigente"
    POR_VENCER = "por_vencer"
    VENCIDO = "vencido"


class ErrorCode(str, Enum):
    PROVEEDOR_NO_ENCONTRADO = "El proveedor solicitado no existe."
    PROVEEDOR_CUIT_DUPLICADO = "Ya existe un proveedor registrado con ese CUIT."
    PROVEEDOR_DADO_DE_BAJA = "El proveedor se encuentra dado de baja."
    HABILITACION_VENCIDA = "La habilitacion sanitaria del proveedor se encuentra vencida."
    HABILITACION_NUMERO_REQUERIDO = "Debe ingresar el numero de habilitacion si especifica una fecha de vencimiento."
    HABILITACION_FECHA_INVALIDA = "La nueva fecha de vencimiento debe ser posterior a la fecha de vencimiento anterior."
    INSUMO_NO_ENCONTRADO_O_INACTIVO = "Uno o mas insumos seleccionados no existen, no son de tipo general o estan dados de baja."
    INSUMOS_REPETIDOS = "No se puede asociar dos veces el mismo insumo al proveedor."


DIAS_AVISO_VENCIMIENTO = 30