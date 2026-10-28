from src.lote_produccion.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class LoteProduccionNoEncontrado(NotFound):
    DETAIL = ErrorCode.LOTE_PRODUCCION_NO_ENCONTRADO


class LoteProduccionDadoDeBaja(BadRequest):
    DETAIL = ErrorCode.LOTE_PRODUCCION_DADO_DE_BAJA


class ProductoDadoDeBaja(BadRequest):
    DETAIL = ErrorCode.PRODUCTO_DADO_DE_BAJA
