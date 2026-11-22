from src.exceptions import BadRequest, NotFound
from src.rotulado.constants import ErrorCode


class ReglasNoEncontradas(NotFound):
    DETAIL = ErrorCode.REGLAS_NO_ENCONTRADAS


class OrdenIngredientesInvalido(NotFound):
    DETAIL = ErrorCode.ORDEN_INVALIDO


class ProductoSinReceta(BadRequest):
    DETAIL = ErrorCode.PRODUCTO_SIN_RECETA


class InformacionNutricionalNoCalculada(BadRequest):
    DETAIL = ErrorCode.INFO_NUTRICIONAL_NO_CALCULADA


class VersionEmpaquetadoNoEncontrada(NotFound):
    DETAIL = ErrorCode.VERSION_EMPAQUETADO_NO_ENCONTRADA
