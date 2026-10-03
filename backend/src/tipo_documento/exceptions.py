from src.tipo_documento.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class TipoDocumentoNoEncontrado(NotFound):
    DETAIL = ErrorCode.TIPO_DOCUMENTO_NO_ENCONTRADO

class TipoDocumentoEnUso(BadRequest):
    DETAIL = ErrorCode.TIPO_DOCUMENTO_EN_USO

class TipoDocumentoDuplicado(BadRequest):
    DETAIL = ErrorCode.TIPO_DOCUMENTO_DUPLICADO