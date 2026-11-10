from src.receta.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class RecetaNoEncontrada(NotFound):
    DETAIL = ErrorCode.RECETA_NO_ENCONTRADA


class RecetaDuplicada(BadRequest):
    DETAIL = ErrorCode.RECETA_DUPLICADA


class InsumoRepetido(BadRequest):
    DETAIL = ErrorCode.INSUMO_REPETIDO


class InsumoNoAlimentario(BadRequest):
    DETAIL = ErrorCode.INSUMO_NO_ALIMENTARIO
