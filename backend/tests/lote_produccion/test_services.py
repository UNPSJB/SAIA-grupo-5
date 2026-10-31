from datetime import date
from src.lote_produccion import services


def test_estadistica_produccion(db_session, lotes_estadistica):
    estadisticas = services.obtener_estadisticas_produccion(
        db=db_session,
        fecha_desde=date(2026, 10, 10),
        fecha_hasta=date(2026, 10, 10)
    )

    assert len(estadisticas) == 2

    cantidades = {
        estadistica.producto_id: estadistica.cantidad
        for estadistica in estadisticas
    }

    assert cantidades[lotes_estadistica[0].producto_id] == 150
    assert cantidades[lotes_estadistica[3].producto_id] == 70


def test_estadistica_filtrar_producto(db_session, lotes_estadistica):
    estadisticas = services.obtener_estadisticas_produccion(
        db=db_session,
        fecha_desde=date(2026, 10, 1),
        fecha_hasta=date(2026, 10, 31),
        producto_id=lotes_estadistica[3].producto_id
    )

    assert len(estadisticas) == 1
    assert estadisticas[0].producto_id == lotes_estadistica[3].producto_id
    assert estadisticas[0].cantidad == 70


def test_estadistica_filtrar_fechas(db_session, lotes_estadistica):
    estadisticas = services.obtener_estadisticas_produccion(
        db=db_session,
        fecha_desde=date(2026, 10, 11),
        fecha_hasta=date(2026, 10, 19)
    )

    assert len(estadisticas) == 1
    assert estadisticas[0].fecha == date(2026, 10, 11)
    assert estadisticas[0].cantidad == 30
