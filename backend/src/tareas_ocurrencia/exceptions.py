from src.tareas_ocurrencia.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class TareaOcurrenciaNoEncontrada(NotFound):
    DETAIL = ErrorCode.TAREA_OCURRENCIA_NO_ENCONTRADA


class TareaOcurrenciaDatosInvalidos(BadRequest):
    DETAIL = ErrorCode.TAREA_OCURRENCIA_DATOS_INVALIDOS
