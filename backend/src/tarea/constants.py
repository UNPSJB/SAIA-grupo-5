import enum

class ErrorCode:
    TAREA_NO_ENCONTRADA = "La tarea no fue encontrada."
    TAREA_DATOS_INVALIDOS = "Los datos de la tarea no son válidos."

class Frecuencia(int, enum.Enum):
    DIARIA = 1
    SEMANAL = 7
    QUINCENAL = 15
    MENSUAL = 30

class Prioridad(str, enum.Enum):
    ALTA = "alta"
    MEDIA = "media"
    BAJA = "baja"
