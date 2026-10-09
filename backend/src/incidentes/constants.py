import os
from enum import Enum


class EstadoIncidente(str, Enum):
    ABIERTO = "abierto"
    CERRADO = "cerrado"


# Se puede ajustar sin modificar código mediante la variable de entorno.
DIAS_UMBRAL_INCIDENTE_DEMORADO = int(os.getenv("DIAS_UMBRAL_INCIDENTE_DEMORADO", "7"))
