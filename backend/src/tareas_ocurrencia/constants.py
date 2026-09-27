import enum

class ErrorCode:
    TAREA_OCURRENCIA_NO_ENCONTRADA = "La ocurrencia de tarea no fue encontrada."
    TAREA_OCURRENCIA_DATOS_INVALIDOS = "Los datos de la ocurrencia no son válidos."

class EstadoTareaOcurrencia(str, enum.Enum):
    PENDIENTE = "Pendiente"
    COMPLETADA = "Completada"
