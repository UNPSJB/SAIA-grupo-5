from src.exceptions import NotFound
from src.accion_correctiva.constants import ErrorCode

class AccionCorrectivaNoEncontrada(NotFound):
    DETAIL = ErrorCode.ACCION_CORRECTIVA_NO_ENCONTRADA
