from src.sector.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class SectorNoEncontrado(NotFound):
    DETAIL = ErrorCode.SECTOR_NO_ENCONTRADO


class SectorDuplicado(BadRequest):
    DETAIL = ErrorCode.SECTOR_DUPLICADO