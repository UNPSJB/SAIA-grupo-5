REGLAS = {
    "requiere_envasado_ausencia_cliente": True,
    "aplica_por_azucares": True,
    "aplica_por_grasas": True,
    "aplica_por_sodio": True,
    "aplica_por_edulcorantes": False,
    "aplica_por_cafeina": True,
    "mensaje_no_corresponde": "No corresponde el rotulado frontal.",
    "mensaje_exceptuado": "Queda exceptuado del rotulado frontal.",
    "observacion": "Los edulcorantes dejan de considerarse",
}


def test_endpoint_leer_reglas_vigentes(client, auth_headers):
    response = client.get("/rotulado/reglas/vigente", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["version"] == 1


def test_endpoint_crear_version_de_reglas(client, auth_headers):
    response = client.post("/rotulado/reglas", json=REGLAS, headers=auth_headers)
    versiones = client.get("/rotulado/reglas", headers=auth_headers).json()

    assert response.status_code == 200
    assert response.json()["version"] == 2
    assert response.json()["aplica_por_edulcorantes"] is False
    assert [(version["version"], version["vigente"]) for version in versiones] == [(2, True), (1, False)]


def test_endpoint_crear_version_de_reglas_sin_observacion(client, auth_headers):
    datos = {clave: valor for clave, valor in REGLAS.items() if clave != "observacion"}

    response = client.post("/rotulado/reglas", json=datos, headers=auth_headers)

    assert response.status_code == 422


def test_endpoint_crear_version_de_reglas_sin_permiso(client, auth_headers_sin_permiso):
    response = client.post("/rotulado/reglas", json=REGLAS, headers=auth_headers_sin_permiso)

    assert response.status_code == 403


def test_endpoint_rotulado_de_producto(client, auth_headers, producto_rotulado, con_receta):
    con_receta(("Harina", 70), ("Azúcar", 30))

    pendiente = client.get(f"/rotulado/productos/{producto_rotulado.id}", headers=auth_headers)
    declarado = client.put(f"/rotulado/productos/{producto_rotulado.id}",
                           json={"envasado_ausencia_cliente": True}, headers=auth_headers)

    assert pendiente.status_code == 200
    assert pendiente.json()["estado"] == "pendiente"
    assert declarado.status_code == 200
    assert declarado.json()["estado"] == "aplica"
    assert declarado.json()["sellos"]["evaluable"] is True


def test_endpoint_declarar_rotulado_sin_permiso(client, auth_headers_sin_permiso, producto_rotulado):
    response = client.put(f"/rotulado/productos/{producto_rotulado.id}",
                          json={"envasado_ausencia_cliente": True}, headers=auth_headers_sin_permiso)

    assert response.status_code == 403


def test_endpoint_rotulado_de_producto_inexistente(client, auth_headers):
    response = client.get("/rotulado/productos/999", headers=auth_headers)

    assert response.status_code == 404


def test_endpoint_vista_previa_rotulado_de_receta(client, auth_headers, producto_rotulado, insumos_rotulado):
    client.put(f"/rotulado/productos/{producto_rotulado.id}", json={"envasado_ausencia_cliente": True}, headers=auth_headers)

    con_sal = client.post("/recetas/rotulado", json={
        "producto_id": producto_rotulado.id,
        "insumos": [{"insumo_id": insumos_rotulado["Harina"].id, "cantidad": 99}, {"insumo_id": insumos_rotulado["Sal"].id, "cantidad": 1}],
    }, headers=auth_headers)
    sin_agregados = client.post("/recetas/rotulado", json={
        "producto_id": producto_rotulado.id,
        "insumos": [{"insumo_id": insumos_rotulado["Harina"].id, "cantidad": 100}],
    }, headers=auth_headers)

    assert con_sal.json()["estado"] == "aplica"
    assert sin_agregados.json()["estado"] == "exceptuado"
    assert sin_agregados.json()["sellos"] is None
