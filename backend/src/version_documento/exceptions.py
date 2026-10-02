from src.version_documento.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class VersionNoEncontrada(NotFound):
    DETAIL = ErrorCode.VERSION_NO_ENCONTRADA

class VersionEnUso(BadRequest):
    DETAIL = ErrorCode.VERSION_EN_USO
