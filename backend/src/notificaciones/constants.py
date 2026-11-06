from enum import Enum


class TipoNotificacion(str, Enum):
    RECAMBIO_ELEMENTO = "recambio_elemento"
    CALIBRACION_EQUIPO = "calibracion_equipo"
    VENCIMIENTO_PERSONAL = "vencimiento_personal"
