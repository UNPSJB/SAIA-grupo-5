import os
from enum import Enum


class ErrorCode:
    INCIDENTE_NO_ENCONTRADO = "El incidente no fue encontrado."
    INCIDENTE_DUPLICADO = "Ya existe un incidente con ese nombre."


class EstadoIncidente(str, Enum):
    ABIERTO = "Abierto"
    CERRADO = "Cerrado"


# Se puede ajustar sin modificar código mediante la variable de entorno.
DIAS_UMBRAL_INCIDENTE_DEMORADO = int(os.getenv("DIAS_UMBRAL_INCIDENTE_DEMORADO", "7"))
