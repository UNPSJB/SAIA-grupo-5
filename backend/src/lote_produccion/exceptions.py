from src.lote_produccion.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class LoteProduccionNoEncontrado(NotFound):
    DETAIL = ErrorCode.LOTE_PRODUCCION_NO_ENCONTRADO


class LoteProduccionDadoDeBaja(BadRequest):
    DETAIL = ErrorCode.LOTE_PRODUCCION_DADO_DE_BAJA


class ProductoDadoDeBaja(BadRequest):
    DETAIL = ErrorCode.PRODUCTO_DADO_DE_BAJA


class LoteYaEnviado(BadRequest):
    DETAIL = ErrorCode.LOTE_YA_ENVIADO


class InsumoNoEncontrado(NotFound):
    DETAIL = ErrorCode.INSUMO_NO_ENCONTRADO


class InsumoDadoDeBaja(BadRequest):
    DETAIL = ErrorCode.INSUMO_DADO_DE_BAJA


class InsumoYaAsociado(BadRequest):
    DETAIL = ErrorCode.INSUMO_YA_ASOCIADO


class InsumoRepetido(BadRequest):
    DETAIL = ErrorCode.INSUMO_REPETIDO


class LoteNoModificable(BadRequest):
    DETAIL = ErrorCode.LOTE_NO_MODIFICABLE
