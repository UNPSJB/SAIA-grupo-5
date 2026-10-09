import enum

class ErrorCode:
    INCIDENTE_NO_ENCONTRADO = "El incidente no fue encontrado."
    INCIDENTE_DUPLICADO = "Ya existe un incidente con ese nombre."   

class EstadoIncidente(str, enum.Enum):
    ABIERTO = "Abierto"
    CERRADO = "Cerrado"