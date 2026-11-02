from src.etapa_receta.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class EtapaNoEncontrada(NotFound):
    DETAIL = ErrorCode.ETAPA_NO_ENCONTRADA


class EtapaUnica(BadRequest):
    DETAIL = ErrorCode.ETAPA_UNICA
