from src.version_documento.constants import ErrorCode
from src.exceptions import NotFound, BadRequest

class VersionNoEncontrada(NotFound):
    DETAIL = ErrorCode.VERSION_NO_ENCONTRADA

class VersionVigente(BadRequest):
    DETAIL = ErrorCode.VERSION_VIGENTE
