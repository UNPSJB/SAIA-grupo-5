from src.exceptions import NotFound, BadRequest
from src.declaracion_alergenos.constants import ErrorCode

class DeclaracionNoEncontrada(NotFound):
    DETAIL = ErrorCode.DECLARACION_NO_ENCONTRADA

class RecetaNoVigente(BadRequest):
    DETAIL = ErrorCode.RECETA_NO_VIGENTE

