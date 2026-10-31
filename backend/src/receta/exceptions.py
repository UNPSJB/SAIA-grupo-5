from src.receta.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class RecetaNoEncontrada(NotFound):
    DETAIL = ErrorCode.RECETA_NO_ENCONTRADA


class RecetaDuplicada(BadRequest):
    DETAIL = ErrorCode.RECETA_DUPLICADA
