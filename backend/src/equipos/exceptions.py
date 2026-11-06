from fastapi import HTTPException, status
from src.equipos.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class EquipoNoEncontrado(NotFound):
    DETAIL = ErrorCode.EQUIPO_NO_ENCONTRADO

class EquipoDuplicado(BadRequest):
    DETAIL = ErrorCode.EQUIPO_DUPLICADO


class EquipoDadoDeBaja(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=ErrorCode.EQUIPO_DADO_DE_BAJA,
        )