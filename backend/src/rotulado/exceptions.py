from src.exceptions import NotFound
from src.rotulado.constants import ErrorCode


class ReglasNoEncontradas(NotFound):
    DETAIL = ErrorCode.REGLAS_NO_ENCONTRADAS
