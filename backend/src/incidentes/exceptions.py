from src.exceptions import NotFound, BadRequest
from src.incidentes.constants import ErrorCode

class IncidenteNoEncontrado(NotFound):
    DETAIL = ErrorCode.INCIDENTE_NO_ENCONTRADO

class IncidenteDuplicado(BadRequest):
    DETAIL = ErrorCode.INCIDENTE_DUPLICADO       
