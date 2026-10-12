from src.exceptions import NotFound, BadRequest
from src.tipo_incidente.constants import ErrorCode

class TipoIncidenteNoEncontrado(NotFound):
    DETAIL = ErrorCode.TIPO_INCIDENTE_NO_ENCONTRADO

class TipoIncidenteDuplicado(BadRequest):
    DETAIL = ErrorCode.TIPO_INCIDENTE_DUPLICADO

class TipoIncidenteUtilizado(BadRequest):
    DETAIL = ErrorCode.TIPO_INCIDENTE_UTILIZADO