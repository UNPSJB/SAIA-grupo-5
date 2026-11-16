from src.exceptions import NotFound, BadRequest
from src.direcciones_cliente.constants import ErrorCode


class DireccionClienteNoEncontrada(NotFound):
    DETAIL = ErrorCode.DIRECCION_NO_ENCONTRADA


class DireccionClienteDadoDeBaja(BadRequest):
    DETAIL = ErrorCode.DIRECCION_DADA_DE_BAJA


class ClienteInactivo(BadRequest):
    DETAIL = ErrorCode.CLIENTE_INACTIVO