from src.exceptions import BadRequest, NotFound
from src.proveedor.constants import ErrorCode


class ProveedorNoEncontrado(NotFound):
    DETAIL = ErrorCode.PROVEEDOR_NO_ENCONTRADO


class ProveedorCuitDuplicado(BadRequest):
    DETAIL = ErrorCode.PROVEEDOR_CUIT_DUPLICADO


class ProveedorDadoDeBaja(BadRequest):
    DETAIL = ErrorCode.PROVEEDOR_DADO_DE_BAJA


class HabilitacionVencida(BadRequest):
    DETAIL = ErrorCode.HABILITACION_VENCIDA


class HabilitacionFechaInvalida(BadRequest):
    DETAIL = ErrorCode.HABILITACION_FECHA_INVALIDA