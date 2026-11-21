from src.exceptions import BadRequest
from src.registro_temperatura.constants import ErrorCode


class EquipoNoControlaTemperatura(BadRequest):
    DETAIL = ErrorCode.EQUIPO_NO_CONTROLA_TEMPERATURA


class RangoTemperaturaInvalido(BadRequest):
    DETAIL = ErrorCode.RANGO_TEMPERATURA_INVALIDO


class AccionTomadaRequerida(BadRequest):
    DETAIL = ErrorCode.ACCION_TOMADA_REQUERIDA
