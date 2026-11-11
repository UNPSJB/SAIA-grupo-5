from datetime import date, timedelta


def test_endpoint_listar_todos_los_insumos_lote(client, auth_headers, multiples_insumos_lote):
    response = client.get("/insumos-lote/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_endpoint_leer_insumo_lote_exitoso(client, auth_headers, unico_insumo_lote):
    response = client.get(f"/insumos-lote/{unico_insumo_lote.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == unico_insumo_lote.id
    assert data["marca"] == "Molinos del Sur"
    assert data["cantidad"] == 50


def test_endpoint_leer_insumo_lote_inexistente(client, auth_headers):
    response = client.get("/insumos-lote/99999", headers=auth_headers)
    assert response.status_code == 404


def test_endpoint_listar_insumos_por_lote_proveedor(client, auth_headers, unico_lote_proveedor, multiples_insumos_lote):
    response = client.get(f"/insumos-lote/por-lote-proveedor/{unico_lote_proveedor.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_endpoint_crear_insumo_lote_exitoso(client, auth_headers, unico_lote_proveedor, unico_insumo):
    payload = {
        "insumo_id": unico_insumo.id,
        "marca": "Ledesma",
        "cantidad": 30,
        "fecha_vencimiento": str(date.today() + timedelta(days=120)),
        "costo_unitario": 950.0,
        "minimo_alerta": 5,
    }
    response = client.post(
        f"/insumos-lote/por-lote-proveedor/{unico_lote_proveedor.id}",
        json=payload,
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["marca"] == "Ledesma"
    assert data["cantidad"] == 30
    assert data["cantidad_restante"] == 30
    assert data["lote_proveedor_id"] == unico_lote_proveedor.id


def test_endpoint_crear_insumo_lote_sin_permiso_operar(client, auth_headers_sin_operar, unico_lote_proveedor, unico_insumo):
    payload = {
        "insumo_id": unico_insumo.id,
        "marca": "Ledesma",
        "cantidad": 30,
        "fecha_vencimiento": str(date.today() + timedelta(days=120)),
        "minimo_alerta": 5
    }
    response = client.post(
        f"/insumos-lote/por-lote-proveedor/{unico_lote_proveedor.id}",
        json=payload,
        headers=auth_headers_sin_operar,
    )
    assert response.status_code == 403


def test_endpoint_crear_insumo_lote_vencimiento_pasado_error(client, auth_headers, unico_lote_proveedor, unico_insumo):
    payload = {
        "insumo_id": unico_insumo.id,
        "marca": "Ledesma",
        "cantidad": 10,
        "fecha_vencimiento": str(date.today() - timedelta(days=1)),
        "minimo_alerta": 5
    }
    response = client.post(
        f"/insumos-lote/por-lote-proveedor/{unico_lote_proveedor.id}",
        json=payload,
        headers=auth_headers,
    )
    assert response.status_code == 400


def test_endpoint_eliminar_insumo_lote_exitoso(client, auth_headers, unico_insumo_lote):
    response = client.delete(f"/insumos-lote/{unico_insumo_lote.id}", headers=auth_headers)
    assert response.status_code == 200


def test_endpoint_eliminar_insumo_lote_inexistente(client, auth_headers):
    response = client.delete("/insumos-lote/99999", headers=auth_headers)
    assert response.status_code == 404