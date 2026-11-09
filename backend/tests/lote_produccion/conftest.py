import pytest
from datetime import date
from src.lote_produccion.models import LoteProduccion
from src.insumos.models import Insumo
from src.personal.models import Persona
from src.auth.utils import get_password_hash


@pytest.fixture
def lotes_estadistica(db_session, multiples_productos):
    producto1, producto2, _ = multiples_productos

    lotes = [
        LoteProduccion(producto_id=producto1.id, fecha_produccion=date(2026, 10, 10),
                    fecha_vencimiento=date(2026, 11, 10), cantidad_producida=100, cantidad_disponible=100, activo=True),

        LoteProduccion(producto_id=producto1.id, fecha_produccion=date(2026, 10, 10),
                    fecha_vencimiento=date(2026, 11, 10), cantidad_producida=50, cantidad_disponible=100, activo=True),

        LoteProduccion(producto_id=producto1.id, fecha_produccion=date(2026, 10, 10),
                    fecha_vencimiento=date(2026, 11, 10), cantidad_producida=40, cantidad_disponible=100, activo=False),

        LoteProduccion(producto_id=producto2.id, fecha_produccion=date(2026, 10, 10),
                    fecha_vencimiento=date(2026, 11, 10), cantidad_producida=70, cantidad_disponible=100, activo=True),

        LoteProduccion(producto_id=producto1.id, fecha_produccion=date(2026, 10, 11),
                    fecha_vencimiento=date(2026, 11, 11), cantidad_producida=30, cantidad_disponible=100, activo=True),

        LoteProduccion(producto_id=producto1.id, fecha_produccion=date(2026, 10, 20),
                    fecha_vencimiento=date(2026, 11, 20), cantidad_producida=90, cantidad_disponible=100, activo=True),
    ]

    db_session.add_all(lotes)
    db_session.commit()

    return lotes


@pytest.fixture
def insumos_para_lote(db_session, unica_unidad_medida):
    insumos = [
        Insumo(nombre="Harina", unidad_medida_id=unica_unidad_medida.id, activo=True),
        Insumo(nombre="Sal", unidad_medida_id=unica_unidad_medida.id, activo=True)
    ]

    db_session.add_all(insumos)
    db_session.commit()

    return insumos


@pytest.fixture
def auth_headers_sin_operar(client, db_session):
    persona = Persona(
        nombre="Usuario",
        apellido="Prueba",
        dni="30111999",
        mail="sin.operar@test.com",
        username="sin_operar",
        hashed_password=get_password_hash("test123"),
        operar=False,
        administrar=False,
        activo=True
    )

    db_session.add(persona)
    db_session.commit()

    response = client.post("/auth/token", data={"username": "sin_operar", "password": "test123"})
    token = response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}
