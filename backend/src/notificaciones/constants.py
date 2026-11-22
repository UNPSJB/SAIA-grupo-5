from enum import Enum


class TipoNotificacion(str, Enum):
    RECAMBIO_ELEMENTO = "recambio_elemento"
    CALIBRACION_EQUIPO = "calibracion_equipo"
    VENCIMIENTO_PERSONAL = "vencimiento_personal"
    ALERTA_STOCK = "alerta_stock"
    VENCIMIENTO_INSUMO_LOTE = "vencimiento_insumo_lote"
    HABILITACION_PROVEEDOR = "habilitacion_proveedor"
    PEDIDO_PROVEEDOR_DEMORADO = "pedido_proveedor_demorado"
    INCIDENTE_LOTE_PRODUCCION = "incidente_lote_produccion"
    INCIDENTE_LOTE_PROVEEDOR = "incidente_lote_proveedor"
    INCIDENTE_INSUMO_LOTE = "incidente_insumo_lote"
    TEMPERATURA_FUERA_RANGO = "temperatura_fuera_rango"
