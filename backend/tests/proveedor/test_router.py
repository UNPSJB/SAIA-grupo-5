from datetime import date, timedelta


def test_endpoint_listar_proveedores(client, auth_headers, unico_proveedor):
    response = client.get("/proveedores/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_endpoint_leer_proveedor(client, auth_headers, unico_proveedor):
    response = client.get(f"/proveedores/{unico_proveedor.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == unico_proveedor.id
    assert data["cuit"] == unico_proveedor.cuit


def test_endpoint_leer_proveedor_no_encontrado(client, auth_headers):
    response = client.get("/proveedores/99999", headers=auth_headers)
    assert response.status_code == 404


def test_endpoint_crear_proveedor(client, auth_headers):
    payload = {
        "nombre": "Harinas del Valle",
        "cuit": "30-77665544-3",
        "telefono": "2804778899",
        "email": "contacto@harinasvalle.com",
        "numero_habilitacion": "HAB-554433",
        "vencimiento_habilitacion": str(date.today() + timedelta(days=180)),
    }
    response = client.post("/proveedores/", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["cuit"] == "30-77665544-3"


def test_endpoint_crear_proveedor_cuit_duplicado_error_400(client, auth_headers, unico_proveedor):
    payload = {
        "nombre": "Repetido",
        "cuit": unico_proveedor.cuit,
    }
    response = client.post("/proveedores/", json=payload, headers=auth_headers)
    assert response.status_code == 400


def test_endpoint_modificar_proveedor(client, auth_headers, unico_proveedor):
    payload = {
        "nombre": "Distribuidora Modificada",
        "cuit": unico_proveedor.cuit,
        "telefono": "2804111222",
        "email": unico_proveedor.email,
        "numero_habilitacion": unico_proveedor.numero_habilitacion,
        "vencimiento_habilitacion": str(unico_proveedor.vencimiento_habilitacion),
    }
    response = client.put(f"/proveedores/{unico_proveedor.id}", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Distribuidora Modificada"


def test_endpoint_cambiar_estado_proveedor(client, auth_headers, unico_proveedor):
    response = client.patch(f"/proveedores/{unico_proveedor.id}/estado", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["activo"] is False