from src.equipos.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class EquipoNoEncontrado(NotFound):
    DETAIL = ErrorCode.EQUIPO_NO_ENCONTRADO

class EquipoDuplicado(BadRequest):
    DETAIL = ErrorCode.EQUIPO_DUPLICADO