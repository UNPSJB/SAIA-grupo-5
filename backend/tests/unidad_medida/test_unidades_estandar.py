from fastapi.testclient import TestClient
from sqlalchemy import select

from src.main import app
from src.unidad_medida.models import UnidadMedida
from src.unidad_medida.services import cargar_unidades_estandar
from tests.database import TestingSessionLocal

ESPERADAS = {
    ("mg", "Miligramo", "MASA", 0.001),
    ("g", "Gramo", "MASA", 1.0),
    ("kg", "Kilogramo", "MASA", 1000.0),
    ("ml", "Mililitro", "VOLUMEN", 1.0),
    ("l", "Litro", "VOLUMEN", 1000.0),
}


def _estandar(unidades):
    return {
        (u["codigo"], u["nombre"], u["masa_volumen"], u["factor_a_base"])
        for u in unidades
        if u["codigo"] is not None
    }


def test_arranque_de_la_app_carga_unidades_estandar(db_session, monkeypatch):
    monkeypatch.setattr("src.lifespan.SessionLocal", TestingSessionLocal)
    with TestClient(app):
        pass

    unidades = db_session.scalars(select(UnidadMedida).where(UnidadMedida.codigo.is_not(None))).all()
    assert {(u.codigo, u.nombre, u.masa_volumen, u.factor_a_base) for u in unidades} == ESPERADAS


def test_cargar_unidades_estandar_es_idempotente(db_session):
    cargar_unidades_estandar(db_session)
    cargar_unidades_estandar(db_session)

    assert len(db_session.scalars(select(UnidadMedida)).all()) == 5


def test_cargar_unidades_estandar_completa_unidad_existente(db_session, unica_unidad_medida):
    cargar_unidades_estandar(db_session)

    kilos = db_session.scalars(select(UnidadMedida).where(UnidadMedida.nombre == "Kilogramo")).all()
    assert len(kilos) == 1
    assert kilos[0].id == unica_unidad_medida.id
    assert (kilos[0].codigo, kilos[0].masa_volumen, kilos[0].factor_a_base) == ("kg", "MASA", 1000.0)


def test_endpoint_listar_unidades_estandar(client, auth_headers, db_session):
    cargar_unidades_estandar(db_session)

    response = client.get("/unidades-medida/", headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()) == 5
    assert _estandar(response.json()) == ESPERADAS


def test_endpoint_listar_unidades_incluye_unidades_sin_conversion(client, auth_headers, db_session):
    db_session.add(UnidadMedida(nombre="Docena", activo=True))
    db_session.commit()
    cargar_unidades_estandar(db_session)

    response = client.get("/unidades-medida/", headers=auth_headers)
    docena = next(u for u in response.json() if u["nombre"] == "Docena")

    assert _estandar(response.json()) == ESPERADAS
    assert (docena["codigo"], docena["masa_volumen"], docena["factor_a_base"]) == (None, None, None)


def test_no_se_puede_crear_unidad_con_datos_de_conversion(client, auth_headers):
    response = client.post("/unidades-medida/", json={
        "nombre": "Onza", "codigo": "oz", "masa_volumen": "MASA", "factor_a_base": 28.35,
    }, headers=auth_headers)

    assert response.status_code == 200
    assert (response.json()["codigo"], response.json()["masa_volumen"], response.json()["factor_a_base"]) == (None, None, None)
