from src.exceptions import NotFound, BadRequest
from src.clientes.constants import ErrorCode


class ClienteNoEncontrado(NotFound):
    DETAIL = ErrorCode.CLIENTE_NO_ENCONTRADO


class ClienteYaExisteCuit(BadRequest):
    DETAIL = ErrorCode.CLIENTE_YA_EXISTE_CUIT


class ClienteDadoDeBaja(BadRequest):
    DETAIL = ErrorCode.CLIENTE_DADO_DE_BAJA