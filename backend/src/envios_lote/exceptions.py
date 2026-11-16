from src.envios_lote.constants import ErrorCode
from src.exceptions import NotFound, BadRequest


class LoteNoEncontrado(NotFound):
    DETAIL = ErrorCode.LOTE_NO_ENCONTRADO


class EstadoLoteInvalido(BadRequest):
    DETAIL = ErrorCode.ESTADO_LOTE_INVALIDO


class CantidadInvalida(BadRequest):
    DETAIL = ErrorCode.CANTIDAD_INVALIDA


class StockInsuficiente(BadRequest):
    DETAIL = ErrorCode.STOCK_INSUFICIENTE


class FechaEnvioAnteriorAProduccion(BadRequest):
    DETAIL = ErrorCode.FECHA_ENVIO_ANTERIOR_A_PRODUCCION


class ClienteNoEncontrado(NotFound):
    DETAIL = ErrorCode.CLIENTE_NO_ENCONTRADO


class ClienteDadoDeBaja(BadRequest):
    DETAIL = ErrorCode.CLIENTE_DADO_DE_BAJA


class DireccionNoEncontrada(NotFound):
    DETAIL = ErrorCode.DIRECCION_NO_ENCONTRADA


class DireccionNoPerteneceAlCliente(BadRequest):
    DETAIL = ErrorCode.DIRECCION_NO_PERTENECE_AL_CLIENTE


class EnvioNoEncontrado(NotFound):
    DETAIL = ErrorCode.ENVIO_NO_ENCONTRADO


class EnvioYaProcesado(BadRequest):
    DETAIL = ErrorCode.ENVIO_YA_PROCESADO


class FechaEntregaAnteriorAEnvio(BadRequest):
    DETAIL = ErrorCode.FECHA_ENTREGA_ANTERIOR_A_ENVIO