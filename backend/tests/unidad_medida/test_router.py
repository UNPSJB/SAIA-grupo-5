def test_endpoint_get_unidad_medida(client, auth_headers, unica_unidad_medida):
    response = client.get(f"/unidades-medida/{unica_unidad_medida.id}",
                headers = auth_headers,)
    data = response.json()

    assert response.status_code == 200
    assert data["id"] == unica_unidad_medida.id
    assert data["nombre"] == unica_unidad_medida.nombre
    assert data["activo"] == unica_unidad_medida.activo


def test_endpoint_listar_unidades_medida(client, auth_headers, multiples_unidades_medida):
    response = client.get("/unidades-medida/", headers = auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert len(data) == 3


def test_endpoint_crear_unidad_medida(client, auth_headers):
    response = client.post("/unidades-medida/", json={"nombre": "Docena"},
                    headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["nombre"] == "Docena"
    assert data["activo"] is True


def test_endpoint_modificar_unidad_medida(client, auth_headers, unica_unidad_medida):
    response = client.put(f"/unidades-medida/{unica_unidad_medida.id}", json={"nombre": "Metro"},
                    headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["nombre"] == "Metro"


def test_endpoint_cambiar_estado_unidad_medida(client, auth_headers, unica_unidad_medida):
    response = client.patch(f"/unidades-medida/{unica_unidad_medida.id}/estado",
                    headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["activo"] is False