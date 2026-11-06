def test_endpoint_get_direccion_cliente(client, auth_headers, unica_direccion_cliente):
    response = client.get(f"/direcciones-cliente/{unica_direccion_cliente.id}",headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["id"] == unica_direccion_cliente.id
    assert data["calle_altura"] == unica_direccion_cliente.calle_altura
    assert data["activo"] is True


def test_endpoint_get_direcciones_por_cliente(client, auth_headers, unico_cliente, multiples_direcciones_cliente):
    response = client.get(f"/direcciones-cliente/cliente/{unico_cliente.id}",headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert len(data) == 3


def test_endpoint_crear_direccion_cliente(client, auth_headers, unico_cliente):
    response = client.post("/direcciones-cliente/",
        json={
            "cliente_id": unico_cliente.id,
            "calle_altura": "25 de Mayo 333",
            "descripcion": "Sucursal Oeste",
        },
        headers=auth_headers,
    )
    data = response.json()

    assert response.status_code == 200
    assert data["cliente_id"] == unico_cliente.id
    assert data["calle_altura"] == "25 de Mayo 333"
    assert data["activo"] is True


def test_endpoint_crear_direccion_cliente_inactivo_error_400(client, auth_headers, unico_cliente):
    client.patch(f"/clientes/{unico_cliente.id}/estado", headers=auth_headers)

    response = client.post("/direcciones-cliente/",
        json={
            "cliente_id": unico_cliente.id,
            "calle_altura": "25 de Mayo 333",
            "descripcion": "Fallo",
        },
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_endpoint_modificar_direccion_cliente(client, auth_headers, unica_direccion_cliente):
    response = client.put(f"/direcciones-cliente/{unica_direccion_cliente.id}",
        json={
            "calle_altura": "Calle Modificada 123",
            "descripcion": "Deposito Renovado",
        },
        headers=auth_headers,
    )
    data = response.json()

    assert response.status_code == 200
    assert data["calle_altura"] == "Calle Modificada 123"


def test_endpoint_cambiar_estado_direccion_cliente(client, auth_headers, unica_direccion_cliente):
    response = client.patch(f"/direcciones-cliente/{unica_direccion_cliente.id}/estado",
        headers=auth_headers,
    )
    data = response.json()

    assert response.status_code == 200
    assert data["activo"] is False


def test_endpoint_modificar_direccion_dada_de_baja_error_400(client, auth_headers, unica_direccion_cliente):
    client.patch(f"/direcciones-cliente/{unica_direccion_cliente.id}/estado", headers=auth_headers)

    response = client.put(f"/direcciones-cliente/{unica_direccion_cliente.id}",
        json={
            "calle_altura": "Calle No Permitida",
            "descripcion": "Fallo",
        },
        headers=auth_headers,
    )
    assert response.status_code == 400