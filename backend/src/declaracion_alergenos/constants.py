from enum import Enum

class EstadoDeclaracion(str, Enum):
    SUGERIDA_SISTEMA = "Sugerida por el sistema"
    CONFIRMADA = "Confirmada"

class ErrorCode:
    DECLARACION_NO_ENCONTRADA = "La declaración de alérgenos y conservación no fue encontrada."
    RECETA_NO_VIGENTE = "No se puede modificar o confirmar la declaración de una receta que no está vigente."

