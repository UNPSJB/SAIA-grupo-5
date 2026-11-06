from src.plan_limpieza.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class PlanLimpiezaNoEncontrado(NotFound):
    DETAIL = ErrorCode.PLAN_LIMPIEZA_NO_ENCONTRADO


class PlanLimpiezaEnUso(BadRequest):
    DETAIL = ErrorCode.PLAN_LIMPIEZA_EN_USO
