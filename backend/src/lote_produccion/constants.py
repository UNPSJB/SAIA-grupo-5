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

    INSUMO_LOTE_NO_ENCONTRADO = "El insumo físico recibido no fue encontrado."
    INSUMO_LOTE_INACTIVO = "No se puede asociar un insumo dado de baja o inactivo."
    INSUMO_LOTE_VENCIDO = "No se puede asociar el insumo: su fecha de vencimiento ya expiró."
    INSUMO_LOTE_PROXIMO_A_VENCER = "No se puede asociar el insumo: le quedan menos de 15 días de vida útil."
    STOCK_INSUFICIENTE_INSUMO_LOTE = "Stock insuficiente en el lote de insumo seleccionado."
