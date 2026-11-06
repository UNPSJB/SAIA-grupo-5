from src.superficies.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class SuperficieNoEncontrada(NotFound):
    DETAIL = ErrorCode.SUPERFICIE_NO_ENCONTRADA


class SuperficieDuplicada(BadRequest):
    DETAIL = ErrorCode.SUPERFICIE_DUPLICADA
