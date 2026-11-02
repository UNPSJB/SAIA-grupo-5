from datetime import date


def test_endpoint_get_lote_produccion(client, auth_headers, unico_lote_produccion):
    response = client.get(f"/lotes-produccion/{unico_lote_produccion.id}", headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["id"] == unico_lote_produccion.id
    assert data["producto_id"] == unico_lote_produccion.producto_id
    assert data["estado"] == "En produccion"


def test_endpoint_listar_lotes_produccion(client, auth_headers, multiples_lotes_produccion):
    response = client.get("/lotes-produccion/", headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert len(data) == 3

def test_endpoint_listar_lotes_historial(client, auth_headers, multiples_lotes_produccion):
    response = client.get("/lotes-produccion/historial", headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert len(data["lotes"]) == 3
    assert data["total_producido"] is None

def test_endpoint_listar_lotes_historial_por_producto(client, auth_headers, multiples_lotes_produccion, unico_producto):
    response = client.get("/lotes-produccion/historial", params={"producto_id": unico_producto.id}, headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert len(data["lotes"]) == 3
    assert all(lote["producto_id"] == unico_producto.id for lote in data["lotes"])
    assert data["total_producido"] == sum(lote["cantidad_producida"] for lote in data["lotes"])

def test_endpoint_listar_lotes_historial_por_fecha(client, auth_headers, multiples_lotes_produccion):
    response = client.get("/lotes-produccion/historial",
        params={ "fecha_desde": "2027-10-01", "fecha_hasta": "2027-10-31", }, 
        headers=auth_headers
    )
    data = response.json()
    
    assert response.status_code == 200
    assert all("2027-10-01" <= lote["fecha_produccion"] <= "2027-10-31" for lote in data["lotes"])
    assert data["total_producido"] is None

    assert response.status_code == 200
    assert len(data["lotes"]) == 3
    assert data["total_producido"] is None

def test_endpoint_listar_lotes_historial_por_producto(client, auth_headers, multiples_lotes_produccion, unico_producto):
    response = client.get("/lotes-produccion/historial", params={"producto_id": unico_producto.id}, headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert len(data["lotes"]) == 3
    assert all(lote["producto_id"] == unico_producto.id for lote in data["lotes"])
    assert data["total_producido"] == sum(lote["cantidad_producida"] for lote in data["lotes"])

def test_endpoint_listar_lotes_historial_por_fecha(client, auth_headers, multiples_lotes_produccion):
    response = client.get("/lotes-produccion/historial",
        params={ "fecha_desde": "2027-10-01", "fecha_hasta": "2027-10-31", }, 
        headers=auth_headers
    )
    data = response.json()

    assert response.status_code == 200
    assert all("2027-10-01" <= lote["fecha_produccion"] <= "2027-10-31" for lote in data["lotes"])
    assert data["total_producido"] is None

def test_endpoint_modificar_lote_produccion(client, auth_headers, unico_lote_produccion, unico_producto):
    response = client.put(
        f"/lotes-produccion/{unico_lote_produccion.id}",
        json={
            "producto_id": unico_producto.id,
            "fecha_produccion": "2027-11-01",
            "fecha_vencimiento": "2028-11-01",
            "cantidad_producida": 200,
        },
        headers=auth_headers,
    )
    data = response.json()

    assert response.status_code == 200
    assert data["cantidad_producida"] == 200


def test_endpoint_cambiar_estado_lote_produccion(client, auth_headers, unico_lote_produccion):
    response = client.patch(
        f"/lotes-produccion/{unico_lote_produccion.id}/estado",
        headers=auth_headers,
    )
    data = response.json()

    assert response.status_code == 200
    assert data["estado"] == "Empaquetando"


def test_endpoint_cambiar_estado_lote_ya_enviado_error_400(client, auth_headers, unico_lote_produccion):
    client.patch(f"/lotes-produccion/{unico_lote_produccion.id}/estado", headers=auth_headers) # Empaquetando
    client.patch(f"/lotes-produccion/{unico_lote_produccion.id}/estado", headers=auth_headers) # Terminado
    client.patch(f"/lotes-produccion/{unico_lote_produccion.id}/estado", headers=auth_headers) # Enviado

    response = client.patch(
        f"/lotes-produccion/{unico_lote_produccion.id}/estado",
        headers=auth_headers,
    )
    assert response.status_code == 400

def test_endpoint_estadistica_produccion(client, auth_headers, lotes_estadistica):
    response = client.get(
        "/lotes-produccion/estadisticas",
        params={
            "fecha_desde": "2026-10-10",
            "fecha_hasta": "2026-10-10"
        },
        headers=auth_headers
    )

    data = response.json()

    assert response.status_code == 200
    assert len(data) == 2

    cantidades = {
        estadistica["producto_id"]: estadistica["cantidad"]
        for estadistica in data
    }

    assert cantidades[lotes_estadistica[0].producto_id] == 150
    assert cantidades[lotes_estadistica[3].producto_id] == 70


def test_endpoint_estadistica_sin_permiso(client, auth_headers_sin_permiso):
    response = client.get(
        "/lotes-produccion/estadisticas",
        params={
            "fecha_desde": "2026-10-01",
            "fecha_hasta": "2026-10-31"
        },
        headers=auth_headers_sin_permiso
    )

    assert response.status_code == 403
