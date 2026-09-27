from fastapi import HTTPException, status
from src.insumos.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class InsumoNoEncontrado(NotFound):
    DETAIL = ErrorCode.INSUMO_NO_ENCONTRADO


class InsumoDuplicado(BadRequest):
    DETAIL = ErrorCode.INSUMO_DUPLICADO


class InsumoDadoDeBaja(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=ErrorCode.INSUMO_DADO_DE_BAJA,
        )
