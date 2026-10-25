from datetime import date


def test_endpoint_get_lote_produccion(client, auth_headers, unico_lote_produccion):
    response = client.get(f"/lotes-produccion/{unico_lote_produccion.id}",headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["id"] == unico_lote_produccion.id
    assert data["producto_id"] == unico_lote_produccion.producto_id
    assert data["activo"] == unico_lote_produccion.activo


def test_endpoint_listar_lotes_produccion(client, auth_headers, multiples_lotes_produccion):
    response = client.get("/lotes-produccion/", headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert len(data) == 3


def test_endpoint_crear_lote_produccion(client, auth_headers, unico_producto):
    response = client.post("/lotes-produccion/",json={
            "producto_id": unico_producto.id,
            "fecha_produccion": "2027-10-01",
            "fecha_vencimiento": "2028-10-01",
            "cantidad_producida": 150},
        headers=auth_headers,
    )
    data = response.json()

    assert response.status_code == 200
    assert data["producto_id"] == unico_producto.id
    assert data["cantidad_producida"] == 150
    assert data["activo"] is True


def test_endpoint_modificar_lote_produccion(client, auth_headers, unico_lote_produccion, unico_producto):
    response = client.put(f"/lotes-produccion/{unico_lote_produccion.id}",json={
            "producto_id": unico_producto.id,
            "fecha_produccion": "2027-11-01",
            "fecha_vencimiento": "2028-11-01",
            "cantidad_producida": 200},
        headers=auth_headers,
    )
    data = response.json()

    assert response.status_code == 200
    assert data["cantidad_producida"] == 200


def test_endpoint_cambiar_estado_lote_produccion(client, auth_headers, unico_lote_produccion):
    response = client.patch(f"/lotes-produccion/{unico_lote_produccion.id}/estado",
        headers=auth_headers,
    )
    data = response.json()

    assert response.status_code == 200
    assert data["activo"] is False