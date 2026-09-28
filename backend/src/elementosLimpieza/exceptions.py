from src.elementosLimpieza.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class ElementoLimpiezaNoEncontrado(NotFound):
    DETAIL = ErrorCode.ELEMENTO_NO_ENCONTRADO


class TipoElementoLimpiezaNoEncontrado(NotFound):
    DETAIL = ErrorCode.TIPO_ELEMENTO_NO_ENCONTRADO

class TipoElementoLimpiezaDuplicado(BadRequest):
    DETAIL = ErrorCode.TIPO_ELEMENTO_DUPLICADO

class PrefijoTipoElementoLimpiezaDuplicado(BadRequest):
    DETAIL = ErrorCode.PREFIJO_TIPO_ELEMENTO_DUPLICADO

class TipoElementoLimpiezaEnUso(BadRequest):
    DETAIL = ErrorCode.TIPO_ELEMENTO_EN_USO