# Cantidad de días de antelación con la que un elemento próximo a vencer
DIAS_ALERTA_RECAMBIO = 3


class ErrorCode:
    ELEMENTO_NO_ENCONTRADO = "Elemento de limpieza no encontrado"
    TIPO_ELEMENTO_NO_ENCONTRADO = "Tipo de elemento de limpieza no encontrado"
    TIPO_ELEMENTO_DUPLICADO = "Tipo de elemento de limpieza duplicado"
    PREFIJO_TIPO_ELEMENTO_DUPLICADO = "El prefijo del tipo de elemento de limpieza ya existe"
    TIPO_ELEMENTO_EN_USO = "No se puede dar de baja el tipo porque tiene elementos activos asociados"