class ErrorCode:
    LOTE_PRODUCCION_NO_ENCONTRADO = "El lote de producción no fue encontrado."
    LOTE_PRODUCCION_DADO_DE_BAJA = "No se puede editar un lote de producción dado de baja."
    PRODUCTO_DADO_DE_BAJA = "No se puede asociar ni activar un lote con un producto dado de baja."
    LOTE_YA_ENVIADO = "El lote de produccion ya se encuentra en estado Enviado y no puede cambiar de estado."

    INSUMO_NO_ENCONTRADO = "El insumo seleccionado no existe."
    INSUMO_DADO_DE_BAJA = "No se puede asociar un insumo dado de baja."
    INSUMO_YA_ASOCIADO = "El insumo ya está asociado a este lote."
    INSUMO_REPETIDO = "No se puede seleccionar dos veces el mismo insumo."
    LOTE_NO_MODIFICABLE = "Solo se pueden modificar insumos de lotes activos en estado En produccion."
