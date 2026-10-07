class ErrorCode:
    VENCIMIENTO_NO_ENCONTRADO = "El registro de vencimiento no fue encontrado"
    FECHAS_INVALIDAS = "La fecha de vencimiento (hasta) no puede ser anterior a la fecha de inicio (desde)."
    TIPO_VENCIMIENTO_INACTIVO = "No se puede asignar un tipo de vencimiento que esta inactivo."
    VENCIMIENTO_DUPLICADO = "La persona ya tiene asignado este tipo de vencimiento."

DIAS_ALERTA_VENCIMIENTO = 15