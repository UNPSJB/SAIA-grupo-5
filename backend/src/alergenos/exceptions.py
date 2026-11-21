from src.exceptions import NotFound, BadRequest
from src.alergenos.constants import ErrorCode

class AlergenoNoEncontrado(NotFound):
    DETAIL = ErrorCode.ALERGENO_NO_ENCONTRADO

class AlergenoDuplicado(BadRequest):
    DETAIL = ErrorCode.ALERGENO_DUPLICADO

class AlergenoUtilizado(BadRequest):
    DETAIL = ErrorCode.ALERGENO_UTILIZADO