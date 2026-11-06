from src.documentos.constants import ErrorCode
from src.exceptions import NotFound, BadRequest

class DocumentoNoEncontrado(NotFound):
    DETAIL = ErrorCode.DOCUMENTO_NO_ENCONTRADO

class DocumentoDuplicado(BadRequest):
    DETAIL = ErrorCode.DOCUMENTO_DUPLICADO
