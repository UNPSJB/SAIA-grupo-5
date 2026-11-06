from src.planesCalibracion.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class PlanCalibracionNoEncontrado(NotFound):
    DETAIL = ErrorCode.PLAN_NO_ENCONTRADO


class PlanCalibracionDuplicado(BadRequest):
    DETAIL = ErrorCode.PLAN_DUPLICADO


class PlanCalibracionInactivo(BadRequest):
    DETAIL = ErrorCode.PLAN_INACTIVO


class FechaPlanCalibracionInvalida(BadRequest):
    DETAIL = ErrorCode.FECHA_PLAN_CALIBRACION_INVALIDA