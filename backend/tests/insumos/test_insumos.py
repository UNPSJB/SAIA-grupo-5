from src.exceptions import PermissionDenied
from src.insumos.constants import ErrorCode


def test_crear_insumo(client, auth_headers, unidad_medida):
    response = client.post(
        "/insumos/",
        json={"nombre": "Lavandina", "unidad_medida_id": unidad_medida.id},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Lavandina"
    assert data["activo"] is True
    assert data["unidad_medida"]["id"] == unidad_medida.id


# error 400
def test_crear_insumo_duplicado(client, auth_headers, insumo):
    response = client.post(
        "/insumos/",
        json={"nombre": insumo.nombre, "unidad_medida_id": insumo.unidad_medida_id},
        headers=auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == ErrorCode.INSUMO_DUPLICADO


# error 403
def test_crear_insumo_sin_permiso(client, auth_headers_sin_permiso, unidad_medida):
    response = client.post(
        "/insumos/",
        json={"nombre": "Lavandina", "unidad_medida_id": unidad_medida.id},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


# error 404
def test_insumo_no_existe(client, auth_headers):
    response = client.get("/insumos/9999", headers=auth_headers)

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ErrorCode.INSUMO_NO_ENCONTRADO


def test_modificar_insumo(client, auth_headers, insumo):
    response = client.put(
        f"/insumos/{insumo.id}",
        json={"nombre": "Detergente Premium", "unidad_medida_id": insumo.unidad_medida_id},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["nombre"] == "Detergente Premium"


# error 404
def test_modificar_insumo_no_existe(client, auth_headers, unidad_medida):
    response = client.put(
        "/insumos/9999",
        json={"nombre": "Detergente Premium", "unidad_medida_id": unidad_medida.id},
        headers=auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ErrorCode.INSUMO_NO_ENCONTRADO


# error 403
def test_modificar_insumo_sin_permiso(client, auth_headers_sin_permiso, insumo):
    response = client.put(
        f"/insumos/{insumo.id}",
        json={"nombre": "Detergente Premium", "unidad_medida_id": insumo.unidad_medida_id},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


# error 409
def test_modificar_insumo_dado_de_baja(client, auth_headers, insumo):
    client.patch(f"/insumos/{insumo.id}/estado", headers=auth_headers)

    response = client.put(
        f"/insumos/{insumo.id}",
        json={"nombre": "Detergente Premium", "unidad_medida_id": insumo.unidad_medida_id},
        headers=auth_headers,
    )

    assert response.status_code == 409
    data = response.json()
    assert data["detail"] == ErrorCode.INSUMO_DADO_DE_BAJA


# error 400 - no se puede dar de alta un insumo si su unidad de medida está dada de baja
def test_alta_insumo_con_unidad_medida_dada_de_baja(client, auth_headers, insumo):
    client.patch(f"/insumos/{insumo.id}/estado", headers=auth_headers)
    client.patch(f"/unidades-medida/{insumo.unidad_medida_id}/estado", headers=auth_headers)

    response = client.patch(f"/insumos/{insumo.id}/estado", headers=auth_headers)

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == ErrorCode.UNIDAD_MEDIDAD_DADA_DE_BAJA


def test_crear_insumo_con_informacion_nutricional(client, auth_headers, unidad_medida):
    response = client.post(
        "/insumos/",
        json={
            "nombre": "Leche entera",
            "unidad_medida_id": unidad_medida.id,
            "valor_energetico": 61,
            "azucares_anadidos": 0,
            "grasas_totales": 3.3,
            "grasas_saturadas": 1.9,
            "sodio": 43,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["valor_energetico"] == 61
    assert data["grasas_saturadas"] == 1.9
    assert data["peso_unidad"] is None


def test_crear_insumo_con_informacion_nutricional_incompleta(client, auth_headers, unidad_medida):
    response = client.post(
        "/insumos/",
        json={"nombre": "Leche entera", "unidad_medida_id": unidad_medida.id, "valor_energetico": 61},
        headers=auth_headers,
    )

    assert response.status_code == 422
    assert ErrorCode.INFORMACION_NUTRICIONAL_INCOMPLETA in response.json()["detail"][0]["msg"]


def test_crear_insumo_con_grasas_saturadas_mayores_a_totales(client, auth_headers, unidad_medida):
    response = client.post(
        "/insumos/",
        json={
            "nombre": "Manteca",
            "unidad_medida_id": unidad_medida.id,
            "valor_energetico": 717,
            "azucares_anadidos": 0,
            "grasas_totales": 10,
            "grasas_saturadas": 51,
            "sodio": 11,
        },
        headers=auth_headers,
    )

    assert response.status_code == 422
    assert ErrorCode.GRASAS_SATURADAS_SUPERAN_TOTALES in response.json()["detail"][0]["msg"]
