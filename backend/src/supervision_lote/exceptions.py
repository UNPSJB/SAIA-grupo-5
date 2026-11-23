from src.exceptions import BadRequest, NotFound, PermissionDenied
from src.supervision_lote.constants import ErrorCode


class SupervisionOcurrenciaNoEncontrada(NotFound):
    DETAIL = ErrorCode.SUPERVISION_OCURRENCIA_NO_ENCONTRADA


class SupervisionOcurrenciaDatosInvalidos(BadRequest):
    DETAIL = ErrorCode.SUPERVISION_OCURRENCIA_DATOS_INVALIDOS


class SupervisionCompletadaPorOtro(PermissionDenied):
    DETAIL = ErrorCode.SUPERVISION_COMPLETADA_POR_OTRO


class ChecklistSupervisionIncompleto(BadRequest):
    DETAIL = ErrorCode.CHECKLIST_SUPERVISION_INCOMPLETO


class ProductoSinReceta(BadRequest):
    DETAIL = ErrorCode.PRODUCTO_SIN_RECETA


class PasoSupervisionPrevioIncompleto(BadRequest):
    DETAIL = ErrorCode.PASO_SUPERVISION_PREVIO_INCOMPLETO
