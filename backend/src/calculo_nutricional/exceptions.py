from src.calculo_nutricional.constants import ErrorCode
from src.exceptions import NotFound, BadRequest

class ConfiguracionNoEncontrada(NotFound):
    DETAIL = ErrorCode.CONFIGURACION_NO_ENCONTRADA

class ParametrosNoEncontrados(BadRequest):
    DETAIL = ErrorCode.PARAMETROS_NO_ENCONTRADOS

class RecetaNoEncontrada(BadRequest):
    DETAIL = ErrorCode.RECETA_NO_ENCONTRADA

class InfoNutricionalRecetaNoEncontrada(BadRequest):
    DETAIL = ErrorCode.INFO_NUTRICIONAL_RECETA_NO_ENCONTRADA

class RendimientoInvalido(BadRequest):
    DETAIL = ErrorCode.RENDIMIENTO_INVALIDO

class PorcionInvalida(BadRequest):
    DETAIL = ErrorCode.PORCION_INVALIDA

class InsumoSinInfoNutricional(BadRequest):
    DETAIL = ErrorCode.INSUMO_SIN_INFO_NUTRICIONAL

class UnidadNoConvertible(BadRequest):
    DETAIL = ErrorCode.UNIDAD_NO_CONVERTIBLE
