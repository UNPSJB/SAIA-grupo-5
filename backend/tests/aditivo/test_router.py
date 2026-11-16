from src.aditivo.constants import ClaseFuncional, ErrorCode


def test_endpoint_crear_aditivo(client, auth_headers):
    response = client.post("/aditivos/", json={"clase_funcional": "Edulcorante", "nombre": "Sucralosa", "numero_ins": "955"},
                           headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["nombre"] == "Sucralosa"
    assert data["activo"] is True


def test_endpoint_crear_aditivo_sin_numero_ins(client, auth_headers):
    response = client.post("/aditivos/", json={"clase_funcional": "Antioxidante", "nombre": "Ácido ascórbico"},
                           headers=auth_headers)

    assert response.status_code == 422
    assert ErrorCode.NUMERO_INS_OBLIGATORIO in response.json()["detail"][0]["msg"]


def test_endpoint_crear_aditivo_sin_permiso(client, auth_headers_sin_permiso):
    response = client.post("/aditivos/", json={"clase_funcional": "Edulcorante", "nombre": "Sucralosa", "numero_ins": "955"},
                           headers=auth_headers_sin_permiso)

    assert response.status_code == 403


def test_endpoint_listar_aditivos(client, auth_headers, multiples_aditivos):
    response = client.get("/aditivos/", headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()) == 3


def test_endpoint_listar_clases_funcionales(client, auth_headers):
    response = client.get("/aditivos/clases-funcionales", headers=auth_headers)

    assert response.status_code == 200
    assert response.json() == [clase.value for clase in ClaseFuncional]


def test_endpoint_modificar_aditivo(client, auth_headers, unico_aditivo):
    response = client.put(f"/aditivos/{unico_aditivo.id}",
                          json={"clase_funcional": "Conservante", "nombre": "Sorbato potásico", "numero_ins": "202"},
                          headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["nombre"] == "Sorbato potásico"


def test_endpoint_cambiar_estado_aditivo(client, auth_headers, unico_aditivo):
    response = client.patch(f"/aditivos/{unico_aditivo.id}/estado", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["activo"] is False
