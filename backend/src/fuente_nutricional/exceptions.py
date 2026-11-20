from src.fuente_nutricional.constants import ErrorCode
from src.exceptions import NotFound, BadRequest

class FuenteNutricionalNoEncontrada(NotFound):
    DETAIL = ErrorCode.FUENTE_NUTRICIONAL_NO_ENCONTRADA

class FuenteNutricionalDuplicada(BadRequest):
    DETAIL = ErrorCode.FUENTE_NUTRICIONAL_DUPLICADA

class FuenteNutricionalEnUso(BadRequest):
    DETAIL = ErrorCode.FUENTE_NUTRICIONAL_USADA

class FuenteNoHabilitada(BadRequest):
    DETAIL = ErrorCode.FUENTE_NO_HABILTADA