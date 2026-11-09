def test_endpoint_get_cliente(client, auth_headers, unico_cliente):
    response = client.get(f"/clientes/{unico_cliente.id}", headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["id"] == unico_cliente.id
    assert data["razon_social"] == unico_cliente.razon_social
    assert data["cuit"] == unico_cliente.cuit
    assert data["activo"] is True


def test_endpoint_get_cliente_no_encontrado(client, auth_headers):
    response = client.get("/clientes/999", headers=auth_headers)
    assert response.status_code == 404


def test_endpoint_listar_clientes(client, auth_headers, multiples_clientes):
    response = client.get("/clientes/", headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert len(data) == 3


def test_endpoint_crear_cliente(client, auth_headers):
    response = client.post("/clientes/",
        json={
            "razon_social": "Nuevo Supermercado",
            "cuit": "30-44556677-8",
            "telefono": "2804556677",
            "email": "contacto@super.com",
        },
        headers=auth_headers,
    )
    data = response.json()

    assert response.status_code == 200
    assert data["razon_social"] == "Nuevo Supermercado"
    assert data["cuit"] == "30-44556677-8"
    assert data["activo"] is True


def test_endpoint_crear_cliente_cuit_duplicado_error_400(client, auth_headers, unico_cliente):
    response = client.post("/clientes/",
        json={
            "razon_social": "Supermercado Clon",
            "cuit": unico_cliente.cuit,
            "telefono": "2804001122",
            "email": "clon@test.com",
        },
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_endpoint_modificar_cliente(client, auth_headers, unico_cliente):
    response = client.put(f"/clientes/{unico_cliente.id}",
        json={
            "razon_social": "Distribuidora Modificada",
            "cuit": unico_cliente.cuit,
            "telefono": "2804990011",
            "email": "modificado@sur.com",
        },
        headers=auth_headers,
    )
    data = response.json()

    assert response.status_code == 200
    assert data["razon_social"] == "Distribuidora Modificada"


def test_endpoint_cambiar_estado_cliente(client, auth_headers, unico_cliente):
    response = client.patch(f"/clientes/{unico_cliente.id}/estado", headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["activo"] is False


def test_endpoint_modificar_cliente_dado_de_baja_error_400(client, auth_headers, unico_cliente):
    client.patch(f"/clientes/{unico_cliente.id}/estado", headers=auth_headers)

    response = client.put(f"/clientes/{unico_cliente.id}",
        json={
            "razon_social": "Intento Modificar",
            "cuit": unico_cliente.cuit,
            "telefono": "11111",
            "email": "error@test.com",
        },
        headers=auth_headers,
    )
    assert response.status_code == 400