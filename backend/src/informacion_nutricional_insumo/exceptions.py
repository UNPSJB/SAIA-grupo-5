from src.informacion_nutricional_insumo.constants import ErrorCode
from src.exceptions import NotFound, BadRequest

class InfoNutricionalNoEncontrada(NotFound):
    DETAIL = ErrorCode.INFO_NUTRICIONAL_NO_ENCONTRADA

class InfoNutricionalDuplicada(BadRequest):
    DETAIL = ErrorCode.INFO_NUTRICIONAL_DUPLICADA

class AzucarAnadidoIncorrecta(BadRequest):
    DETAIL = ErrorCode.AZUCAR_ANADIDO_INCORRECTA

class AzucarTotalIncorrecta(BadRequest):
    DETAIL = ErrorCode.AZUCAR_TOTAL_INCORRECTA

class GrasaTotalIncorrecta(BadRequest):
    DETAIL = ErrorCode.GRASA_TOTAL_INCORRECTA

class AsociacionIncorrecta(BadRequest):
    DETAIL = ErrorCode.ASOCIACION_INCORRECTA

class DatosObligatoriosFaltantes(BadRequest):
    DETAIL = ErrorCode.DATOS_OBLIGATORIOS_FALTANTES
