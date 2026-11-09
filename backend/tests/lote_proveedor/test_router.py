from datetime import date


def test_endpoint_listar_lotes_proveedor(client, auth_headers, unico_lote_proveedor):
    response = client.get("/lotes-proveedor/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_endpoint_leer_lote_proveedor(client, auth_headers, unico_lote_proveedor):
    response = client.get(f"/lotes-proveedor/{unico_lote_proveedor.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == unico_lote_proveedor.id
    assert data["numero_lote"] == unico_lote_proveedor.numero_lote


def test_endpoint_leer_lote_proveedor_no_encontrado(client, auth_headers):
    response = client.get("/lotes-proveedor/99999", headers=auth_headers)
    assert response.status_code == 404


def test_endpoint_crear_lote_proveedor_exitoso(client, auth_headers, unico_proveedor):
    payload = {
        "proveedor_id": unico_proveedor.id,
        "numero_lote": "LOTE-ROUTER-01",
        "numero_remito": "REM-ROUTER-99",
        "fecha_recepcion": str(date.today()),
    }

    response = client.post("/lotes-proveedor/", json=payload, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["numero_lote"] == "LOTE-ROUTER-01"
    assert data["proveedor"]["id"] == unico_proveedor.id


def test_endpoint_crear_lote_proveedor_sin_permiso_operar(client, auth_headers_sin_operar, unico_proveedor):
    payload = {
        "proveedor_id": unico_proveedor.id,
        "numero_lote": "LOTE-SIN-PERMISO",
        "fecha_recepcion": str(date.today()),
    }

    response = client.post("/lotes-proveedor/", json=payload, headers=auth_headers_sin_operar)

    assert response.status_code == 403


def test_endpoint_crear_lote_proveedor_habilitacion_vencida_error_400(client, auth_headers, multiples_proveedores):
    proveedor_vencido = multiples_proveedores[1]
    payload = {
        "proveedor_id": proveedor_vencido.id,
        "numero_lote": "LOTE-RECHAZADO",
        "numero_remito": "R-TEST-9999",
        "fecha_recepcion": str(date.today()),
    }

    response = client.post("/lotes-proveedor/", json=payload, headers=auth_headers)
    
    assert response.status_code == 400


def test_endpoint_modificar_lote_proveedor(client, auth_headers, unico_lote_proveedor):
    payload = {
        "numero_lote": "LOTE-ACTUALIZADO",
        "numero_remito": "REM-ACTUALIZADO",
        "fecha_recepcion": str(date.today()),
    }

    response = client.put(f"/lotes-proveedor/{unico_lote_proveedor.id}", json=payload, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["numero_lote"] == "LOTE-ACTUALIZADO"


def test_endpoint_cambiar_estado_lote_proveedor(client, auth_headers, unico_lote_proveedor):
    response = client.patch(f"/lotes-proveedor/{unico_lote_proveedor.id}/estado", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["activo"] is False