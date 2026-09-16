import enum

class EstadoTareaOcurrencia(str, enum.Enum):
    PENDIENTE = "Pendiente"
    COMPLETADA = "Completada"
