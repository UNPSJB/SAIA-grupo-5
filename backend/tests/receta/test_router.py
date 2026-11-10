import pytest

from src.insumos.models import Insumo
from src.receta.constants import ErrorCode, SelloFrontal
from src.unidad_medida.models import UnidadMedida


ETAPAS = [{"nombre": "Elaboración", "pasos": [{"descripcion": "Mezclar los ingredientes"}]}]


@pytest.fixture
def gramo(db_session):
    unidad = UnidadMedida(nombre="Gramo", activo=True)
    db_session.add(unidad)
    db_session.commit()
    db_session.refresh(unidad)
    return unidad


@pytest.fixture
def insumos_alimentarios(db_session, gramo):
    insumos = [
        Insumo(nombre="Azúcar", unidad_medida_id=gramo.id, activo=True,
               valor_energetico=400, azucares_anadidos=100, grasas_totales=0, grasas_saturadas=0, sodio=0),
        Insumo(nombre="Harina", unidad_medida_id=gramo.id, activo=True,
               valor_energetico=364, azucares_anadidos=0, grasas_totales=1, grasas_saturadas=0.2, sodio=2),
        Insumo(nombre="Colorante", unidad_medida_id=gramo.id, activo=False),
    ]
    db_session.add_all(insumos)
    db_session.commit()
    for insumo in insumos:
        db_session.refresh(insumo)
    return insumos


def test_crear_receta_con_insumos_y_sellos(client, auth_headers, unico_producto, insumos_alimentarios):
    azucar, harina, _ = insumos_alimentarios
    response = client.post("/recetas/", json={
        "producto_id": unico_producto.id,
        "etapas": ETAPAS,
        "insumos": [
            {"insumo_id": harina.id, "cantidad": 700},
            {"insumo_id": azucar.id, "cantidad": 300},
        ],
    }, headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert [item["nombre"] for item in data["insumos"]] == ["Harina", "Azúcar"]
    assert data["insumos"][0]["unidad_medida"]["nombre"] == "Gramo"
    assert data["sellos"]["evaluable"] is True
    assert data["sellos"]["sellos"] == [SelloFrontal.EXCESO_AZUCARES, SelloFrontal.EXCESO_CALORIAS]


def test_crear_receta_sin_insumos(client, auth_headers, unico_producto):
    response = client.post("/recetas/", json={"producto_id": unico_producto.id, "etapas": ETAPAS}, headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["insumos"] == []
    assert data["sellos"]["evaluable"] is False


def test_crear_receta_con_insumo_repetido(client, auth_headers, unico_producto, insumos_alimentarios):
    azucar = insumos_alimentarios[0]
    response = client.post("/recetas/", json={
        "producto_id": unico_producto.id,
        "etapas": ETAPAS,
        "insumos": [{"insumo_id": azucar.id, "cantidad": 1}, {"insumo_id": azucar.id, "cantidad": 2}],
    }, headers=auth_headers)

    assert response.status_code == 400
    assert response.json()["detail"] == ErrorCode.INSUMO_REPETIDO


def test_crear_receta_con_insumo_inactivo(client, auth_headers, unico_producto, insumos_alimentarios):
    colorante = insumos_alimentarios[2]
    response = client.post("/recetas/", json={
        "producto_id": unico_producto.id,
        "etapas": ETAPAS,
        "insumos": [{"insumo_id": colorante.id, "cantidad": 1}],
    }, headers=auth_headers)

    assert response.status_code == 400
    assert response.json()["detail"] == ErrorCode.INSUMO_NO_ALIMENTARIO


def test_actualizar_insumos_de_receta(client, auth_headers, unico_producto, insumos_alimentarios):
    azucar, harina, _ = insumos_alimentarios
    creada = client.post("/recetas/", json={
        "producto_id": unico_producto.id,
        "etapas": ETAPAS,
        "insumos": [{"insumo_id": azucar.id, "cantidad": 300}, {"insumo_id": harina.id, "cantidad": 700}],
    }, headers=auth_headers).json()

    response = client.put(f"/recetas/{creada['id']}", json={
        "etapas": ETAPAS,
        "insumos": [{"insumo_id": harina.id, "cantidad": 1000}],
    }, headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert [(item["nombre"], item["cantidad"]) for item in data["insumos"]] == [("Harina", 1000)]
    assert data["sellos"]["sellos"] == []


def test_actualizar_receta_sin_enviar_insumos_los_conserva(client, auth_headers, unico_producto, insumos_alimentarios):
    azucar = insumos_alimentarios[0]
    creada = client.post("/recetas/", json={
        "producto_id": unico_producto.id,
        "etapas": ETAPAS,
        "insumos": [{"insumo_id": azucar.id, "cantidad": 300}],
    }, headers=auth_headers).json()

    response = client.put(f"/recetas/{creada['id']}", json={"etapas": ETAPAS}, headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()["insumos"]) == 1


def test_evaluar_sellos(client, auth_headers, unico_producto, insumos_alimentarios):
    azucar, harina, _ = insumos_alimentarios
    response = client.post("/recetas/sellos", json={
        "producto_id": unico_producto.id,
        "insumos": [{"insumo_id": harina.id, "cantidad": 1000}],
    }, headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["evaluable"] is True
    assert data["cantidad_base"] == 1000
    assert data["valor_energetico"] == 364
    assert data["sellos"] == []


def test_evaluar_sellos_sin_permiso(client, auth_headers_sin_permiso, unico_producto):
    response = client.post("/recetas/sellos", json={"producto_id": unico_producto.id, "insumos": []},
                           headers=auth_headers_sin_permiso)

    assert response.status_code == 403
