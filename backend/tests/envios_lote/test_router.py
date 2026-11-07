from datetime import date
from src.lote_produccion import services as lote_services


def test_endpoint_crear_envio(client, auth_headers, db_session, unico_lote_produccion, unico_cliente, unica_direccion_cliente):
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id)

    response = client.post(
        "/envios-lote/",
        json={
            "lote_id": unico_lote_produccion.id,
            "cliente_id": unico_cliente.id,
            "direccion_cliente_id": unica_direccion_cliente.id,
            "cantidad": 25,
            "numero_remito": "R-0001-00000002",
            "transportista": "Vía Cargo",
            "fecha_envio": "2026-10-15",
        },
        headers=auth_headers
    )
    data = response.json()

    assert response.status_code == 200
    assert data["cantidad"] == 25
    assert data["numero_remito"] == "R-0001-00000002"
    assert data["estado"] == "En camino"
    assert data["cliente"]["id"] == unico_cliente.id
    assert data["direccion"]["id"] == unica_direccion_cliente.id


def test_endpoint_crear_envio_sin_permiso_operar(client, auth_headers_sin_operar, db_session, unico_lote_produccion, unico_cliente, unica_direccion_cliente):
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id)

    response = client.post(
        "/envios-lote/",
        json={
            "lote_id": unico_lote_produccion.id,
            "cliente_id": unico_cliente.id,
            "direccion_cliente_id": unica_direccion_cliente.id,
            "cantidad": 10,
            "numero_remito": "R-0001-00000003",
            "transportista": "Transporte Sur",
            "fecha_envio": "2026-10-15",
        },
        headers=auth_headers_sin_operar
    )
    assert response.status_code == 403


def test_endpoint_crear_envio_stock_insuficiente_error_400(client, auth_headers, db_session, unico_lote_produccion, unico_cliente, unica_direccion_cliente):
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id)
    lote_services.cambiar_estado_lote_produccion(db_session, unico_lote_produccion.id)

    response = client.post(
        "/envios-lote/",
        json={
            "lote_id": unico_lote_produccion.id,
            "cliente_id": unico_cliente.id,
            "direccion_cliente_id": unica_direccion_cliente.id,
            "cantidad": 9999,
            "numero_remito": "R-0001-00000004",
            "transportista": "Transporte Sur",
            "fecha_envio": "2026-10-15",
        },
        headers=auth_headers
    )
    assert response.status_code == 400


def test_endpoint_crear_envio_schema_invalido_error_422(client, auth_headers, unico_lote_produccion):
    response = client.post(
        "/envios-lote/",
        json={
            "lote_id": unico_lote_produccion.id,
            "cantidad": 10
        },
        headers=auth_headers
    )
    assert response.status_code == 422


def test_endpoint_registrar_recepcion(client, auth_headers, unico_envio):
    response = client.patch(
        f"/envios-lote/{unico_envio.id}/recepcion",
        json={
            "recibido": True,
            "fecha_entrega": "2026-10-20",
            "observaciones": "Recepción conforme"
        },
        headers=auth_headers
    )
    data = response.json()

    assert response.status_code == 200
    assert data["estado"] == "Entregado"
    assert data["fecha_entrega"] == "2026-10-20"
    assert data["observaciones"] == "Recepción conforme"


def test_endpoint_registrar_recepcion_fecha_invalida_error_400(client, auth_headers, unico_envio):
    response = client.patch(
        f"/envios-lote/{unico_envio.id}/recepcion",
        json={
            "recibido": True,
            "fecha_entrega": "2026-10-01", 
            "observaciones": "Fecha mal cargada"
        },
        headers=auth_headers
    )
    assert response.status_code == 400


def test_endpoint_listar_multiples_envios_por_lote(client, auth_headers, multiples_envios, unico_lote_produccion):
    response = client.get(
        f"/envios-lote/lote/{unico_lote_produccion.id}",
        headers=auth_headers
    )
    data = response.json()

    assert response.status_code == 200
    assert len(data) == 2
    assert data[0]["numero_remito"] == "R-0001-00000002"
    assert data[1]["numero_remito"] == "R-0001-00000001"


def test_endpoint_get_envio_no_encontrado(client, auth_headers):
    response = client.get("/envios-lote/9999", headers=auth_headers)
    assert response.status_code == 404