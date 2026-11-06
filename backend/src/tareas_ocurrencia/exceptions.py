from src.tareas_ocurrencia.constants import ErrorCode
from src.exceptions import NotFound, BadRequest, PermissionDenied


class TareaOcurrenciaNoEncontrada(NotFound):
    DETAIL = ErrorCode.TAREA_OCURRENCIA_NO_ENCONTRADA


class TareaOcurrenciaDatosInvalidos(BadRequest):
    DETAIL = ErrorCode.TAREA_OCURRENCIA_DATOS_INVALIDOS

class TareaOcurrenciaCompletadaPorOtro(PermissionDenied):
    DETAIL = ErrorCode.TAREA_OCURRENCIA_COMPLETADA_POR_OTRO