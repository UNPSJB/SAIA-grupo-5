from enum import Enum


class Capacidades(str, Enum):
    OPERAR = "operar"
    ADMINISTRAR = "administrar"


class ErrorCode:
    PERSONA_NO_ENCONTRADA = "La persona no fue encontrada."
