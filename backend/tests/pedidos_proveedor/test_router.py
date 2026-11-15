from datetime import date, timedelta
from src.proveedor.models import ProveedorInsumo


def test_endpoint_listar_pedidos_proveedor(client, auth_headers, multiples_pedidos_proveedor):
    response = client.get("/pedidos-proveedor/", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 3


def test_endpoint_leer_pedido_proveedor(client, auth_headers, unico_pedido_proveedor):
    response = client.get(f"/pedidos-proveedor/{unico_pedido_proveedor.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == unico_pedido_proveedor.id
    assert data["estado"] == "pendiente"


def test_endpoint_leer_pedido_proveedor_no_encontrado(client, auth_headers):
    response = client.get("/pedidos-proveedor/99999", headers=auth_headers)
    assert response.status_code == 404


def test_endpoint_crear_pedido_proveedor_exitoso(client, auth_headers, db_session, unico_proveedor, unico_insumo):
    db_session.add(ProveedorInsumo(proveedor_id=unico_proveedor.id, insumo_id=unico_insumo.id))
    db_session.commit()

    payload = {
        "proveedor_id": unico_proveedor.id,
        "fecha_entrega_estimada": str(date.today() + timedelta(days=7)),
        "observacion": "Pedido semanal",
        "items": [{"insumo_id": unico_insumo.id, "cantidad_pedida": 60}],
    }

    response = client.post("/pedidos-proveedor/", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["proveedor_id"] == unico_proveedor.id
    assert data["estado"] == "pendiente"
    assert len(data["items"]) == 1


def test_endpoint_crear_pedido_sin_permiso_administrar(client, auth_headers_sin_permiso, unico_proveedor, unico_insumo):
    payload = {
        "proveedor_id": unico_proveedor.id,
        "items": [{"insumo_id": unico_insumo.id, "cantidad_pedida": 10}],
    }

    response = client.post("/pedidos-proveedor/", json=payload, headers=auth_headers_sin_permiso)
    assert response.status_code == 403


def test_endpoint_modificar_pedido_proveedor(client, auth_headers, unico_pedido_proveedor, unico_insumo):
    payload = {
        "fecha_entrega_estimada": str(date.today() + timedelta(days=14)),
        "observacion": "Modificado por router",
        "items": [{"insumo_id": unico_insumo.id, "cantidad_pedida": 120}],
    }

    response = client.put(f"/pedidos-proveedor/{unico_pedido_proveedor.id}", json=payload, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["observacion"] == "Modificado por router"


def test_endpoint_cambiar_estado_pedido_proveedor(client, auth_headers, unico_pedido_proveedor):
    response = client.patch(f"/pedidos-proveedor/{unico_pedido_proveedor.id}/estado", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["activo"] is False