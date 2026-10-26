def test_endpoint_get_producto(client, auth_headers, unico_producto):
    response = client.get(f"/productos/{unico_producto.id}",
                headers = auth_headers,)
    data = response.json()

    assert response.status_code == 200
    assert data["id"] == unico_producto.id
    assert data["nombre"] == unico_producto.nombre
    assert data["activo"] == unico_producto.activo


def test_endpoint_listar_productos(client, auth_headers, multiples_productos):
    response = client.get("/productos/", headers = auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert len(data) == 3


def test_endpoint_crear_producto(client, auth_headers, unica_unidad_medida):
    response = client.post("/productos/", json={"nombre": "Crema", "descripcion": "Alguna",
                                                "cantidad_neta": 3, "unidad_medida_id": unica_unidad_medida.id,
                                                "fecha_lanzamiento": "2026-10-20", "foto_producto": None
                                                },
                    headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["nombre"] == "Crema"
    assert data["cantidad_neta"] == 3
    assert data["activo"] is True


def test_endpoint_modificar_producto(client, auth_headers, unico_producto, unica_unidad_medida):
    response = client.put(f"/productos/{unico_producto.id}", json={"nombre": "Crema cremosa",
                                                                    "descripcion": "Alguna descripcion",
                                                                    "cantidad_neta": 2,
                                                                    "unidad_medida_id": unica_unidad_medida.id,
                                                                    "fecha_lanzamiento": "2026-10-20",
                                                                    "foto_producto": None,},
                    headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["nombre"] == "Crema cremosa"


def test_endpoint_cambiar_estado_producto(client, auth_headers, unico_producto):
    response = client.patch(f"/productos/{unico_producto.id}/estado",
                    headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["activo"] is False