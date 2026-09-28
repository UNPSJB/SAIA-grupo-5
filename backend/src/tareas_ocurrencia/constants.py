import enum

class ErrorCode:
    TAREA_OCURRENCIA_NO_ENCONTRADA = "La ocurrencia de tarea no fue encontrada."
    TAREA_OCURRENCIA_DATOS_INVALIDOS = "Los datos de la ocurrencia no son válidos."
    TAREA_OCURRENCIA_COMPLETADA_POR_OTRO = "No puede editar esta tarea ya que fue marcada como completada por otro operario."

class EstadoTareaOcurrencia(str, enum.Enum):
    PENDIENTE = "Pendiente"
    COMPLETADA = "Completada"
