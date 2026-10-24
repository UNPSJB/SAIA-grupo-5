from src.producto.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class ProductoNoEncontrado(NotFound):
    DETAIL = ErrorCode.PRODUCTO_NO_ENCONTRADO


class ProductoDuplicado(BadRequest):
    DETAIL = ErrorCode.PRODUCTO_DUPLICADO

class ProductoDadoDeBaja(BadRequest):
    DETAIL = ErrorCode.PRODUCTO_DADO_DE_BAJA
