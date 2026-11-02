import pytest
from datetime import date
from src.lote_produccion.models import LoteProduccion


@pytest.fixture
def lotes_estadistica(db_session, multiples_productos):
    producto1, producto2, _ = multiples_productos

    lotes = [
        LoteProduccion(producto_id=producto1.id, fecha_produccion=date(2026, 10, 10),
                       fecha_vencimiento=date(2026, 11, 10), cantidad_producida=100, activo=True),

        LoteProduccion(producto_id=producto1.id, fecha_produccion=date(2026, 10, 10),
                       fecha_vencimiento=date(2026, 11, 10), cantidad_producida=50, activo=True),

        LoteProduccion(producto_id=producto1.id, fecha_produccion=date(2026, 10, 10),
                       fecha_vencimiento=date(2026, 11, 10), cantidad_producida=40, activo=False),

        LoteProduccion(producto_id=producto2.id, fecha_produccion=date(2026, 10, 10),
                       fecha_vencimiento=date(2026, 11, 10), cantidad_producida=70, activo=True),

        LoteProduccion(producto_id=producto1.id, fecha_produccion=date(2026, 10, 11),
                       fecha_vencimiento=date(2026, 11, 11), cantidad_producida=30, activo=True),

        LoteProduccion(producto_id=producto1.id, fecha_produccion=date(2026, 10, 20),
                       fecha_vencimiento=date(2026, 11, 20), cantidad_producida=90, activo=True),
    ]

    db_session.add_all(lotes)
    db_session.commit()

    return lotes