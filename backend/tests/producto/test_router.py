from src.configuracion_sistema.models import ConfiguracionSistema
from src.configuracion_sistema.constants import ID_CONFIGURACION_SISTEMA

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


def test_endpoint_crear_producto_con_codigo(client, auth_headers, db_session, unica_unidad_medida):
    configuracion = ConfiguracionSistema(id=ID_CONFIGURACION_SISTEMA, prefijo_gs1="590", prefijo_empresa="1234")
    db_session.add(configuracion)
    db_session.commit()

    response = client.post("/productos/", json={"nombre": "Producto con codigo", "descripcion": "Producto de prueba",
                                                "cantidad_neta": 500, "unidad_medida_id": unica_unidad_medida.id,
                                                "fecha_lanzamiento": "2026-10-01", "foto_producto": None,
                                                "codigo_producto": "12345"},
                    headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["codigo_producto"] == "12345"
    assert data["codigo_barras"] == "5901234123457"


def test_endpoint_modificar_codigo_producto(client, auth_headers, db_session, unico_producto, unica_unidad_medida):
    configuracion = ConfiguracionSistema(id=ID_CONFIGURACION_SISTEMA, prefijo_gs1="590", prefijo_empresa="1234")
    db_session.add(configuracion)
    db_session.commit()

    response = client.put(f"/productos/{unico_producto.id}", json={"nombre": unico_producto.nombre,
                                                                    "descripcion": "Producto modificado",
                                                                    "cantidad_neta": 500,
                                                                    "unidad_medida_id": unica_unidad_medida.id,
                                                                    "fecha_lanzamiento": "2026-10-01",
                                                                    "foto_producto": None,
                                                                    "codigo_producto": "12345"},
                    headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["codigo_producto"] == "12345"
    assert data["codigo_barras"] == "5901234123457"
