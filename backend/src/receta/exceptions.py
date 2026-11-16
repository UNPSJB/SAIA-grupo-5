from src.receta.constants import ErrorCode
from fastapi import status
from src.exceptions import DetailedHTTPException, NotFound, BadRequest


class RecetaNoEncontrada(NotFound):
    DETAIL = ErrorCode.RECETA_NO_ENCONTRADA


class RecetaDuplicada(BadRequest):
    DETAIL = ErrorCode.RECETA_DUPLICADA


class InsumoRepetido(BadRequest):
    DETAIL = ErrorCode.INSUMO_REPETIDO


class InsumoNoAlimentario(BadRequest):
    DETAIL = ErrorCode.INSUMO_NO_ALIMENTARIO


class RecetaSoloLectura(DetailedHTTPException):
    STATUS_CODE = status.HTTP_409_CONFLICT
    DETAIL = ErrorCode.RECETA_SOLO_LECTURA


class AditivoNoDisponible(BadRequest):
    DETAIL = ErrorCode.ADITIVO_NO_DISPONIBLE


class UnidadMedidaNoDisponible(BadRequest):
    DETAIL = ErrorCode.UNIDAD_MEDIDA_NO_DISPONIBLE
