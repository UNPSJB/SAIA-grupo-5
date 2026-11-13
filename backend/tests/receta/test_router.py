from src.receta.constants import ErrorCode, SelloFrontal


ETAPAS = [{"nombre": "Elaboración", "pasos": [{"descripcion": "Mezclar los ingredientes"}]}]


def _receta(unidades_sellos, insumos, **extra):
    return {
        "rendimiento": 100,
        "rendimiento_unidad_medida_id": unidades_sellos["Gramo"].id,
        "etapas": ETAPAS,
        "insumos": insumos,
        **extra,
    }


def test_crear_receta_con_ingredientes_y_aditivos(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos, aditivos_receta):
    response = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        **_receta(unidades_sellos, [
            {"insumo_id": insumos_sellos["Harina"].id, "cantidad": 70},
            {"insumo_id": insumos_sellos["Azúcar"].id, "cantidad": 30},
            {"insumo_id": insumos_sellos["Esencia"].id, "cantidad": 1, "tipo": "Aditivo",
             "aditivo_id": aditivos_receta["Aroma de vainilla"].id},
        ], porcion=25, porcion_unidad_medida_id=unidades_sellos["Gramo"].id),
    }, headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["version"] == 1
    assert data["vigente"] is True
    assert data["rendimiento"] == 100
    assert data["rendimiento_unidad_medida"]["nombre"] == "Gramo"
    assert data["porcion"] == 25
    assert [(item["nombre"], item["tipo"]) for item in data["insumos"]] == [
        ("Harina", "Ingrediente"), ("Azúcar", "Ingrediente"), ("Esencia", "Aditivo"),
    ]
    assert data["insumos"][2]["aditivo"] == {
        "id": aditivos_receta["Aroma de vainilla"].id,
        "clase_funcional": "Aromatizante",
        "nombre": "Aroma de vainilla",
        "numero_ins": None,
    }
    assert data["sellos"]["sellos"] == [SelloFrontal.EXCESO_AZUCARES, SelloFrontal.EXCESO_CALORIAS]


def test_crear_receta_sin_ingredientes(client, auth_headers, producto_solido, unidades_sellos):
    response = client.post("/recetas/", json={"producto_id": producto_solido.id, **_receta(unidades_sellos, [])},
                           headers=auth_headers)

    assert response.status_code == 422


def test_crear_receta_solo_con_aditivos(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos, aditivos_receta):
    response = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        **_receta(unidades_sellos, [
            {"insumo_id": insumos_sellos["Esencia"].id, "cantidad": 1, "tipo": "Aditivo",
             "aditivo_id": aditivos_receta["Aroma de vainilla"].id},
        ]),
    }, headers=auth_headers)

    assert response.status_code == 422
    assert ErrorCode.RECETA_SIN_INGREDIENTES in response.json()["detail"][0]["msg"]


def test_crear_receta_sin_rendimiento(client, auth_headers, producto_solido, insumos_sellos):
    response = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        "etapas": ETAPAS,
        "insumos": [{"insumo_id": insumos_sellos["Harina"].id, "cantidad": 100}],
    }, headers=auth_headers)

    assert response.status_code == 422


def test_crear_receta_con_aditivo_sin_clase_funcional(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos):
    response = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        **_receta(unidades_sellos, [
            {"insumo_id": insumos_sellos["Harina"].id, "cantidad": 100},
            {"insumo_id": insumos_sellos["Esencia"].id, "cantidad": 1, "tipo": "Aditivo"},
        ]),
    }, headers=auth_headers)

    assert response.status_code == 422
    assert ErrorCode.ADITIVO_SIN_CLASE_FUNCIONAL in response.json()["detail"][0]["msg"]


def test_crear_receta_con_aditivo_sin_cantidad(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos, aditivos_receta):
    response = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        **_receta(unidades_sellos, [
            {"insumo_id": insumos_sellos["Harina"].id, "cantidad": 100},
            {"insumo_id": insumos_sellos["Esencia"].id, "cantidad": 0, "tipo": "Aditivo",
             "aditivo_id": aditivos_receta["Aroma de vainilla"].id},
        ]),
    }, headers=auth_headers)

    assert response.status_code == 422


def test_crear_receta_con_aditivo_dado_de_baja(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos, aditivos_receta):
    response = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        **_receta(unidades_sellos, [
            {"insumo_id": insumos_sellos["Harina"].id, "cantidad": 100},
            {"insumo_id": insumos_sellos["Esencia"].id, "cantidad": 1, "tipo": "Aditivo",
             "aditivo_id": aditivos_receta["Tartrazina"].id},
        ]),
    }, headers=auth_headers)

    assert response.status_code == 400
    assert response.json()["detail"] == ErrorCode.ADITIVO_NO_DISPONIBLE


def test_crear_receta_con_porcion_incompleta(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos):
    response = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        **_receta(unidades_sellos, [{"insumo_id": insumos_sellos["Harina"].id, "cantidad": 100}], porcion=25),
    }, headers=auth_headers)

    assert response.status_code == 422
    assert ErrorCode.PORCION_INCOMPLETA in response.json()["detail"][0]["msg"]


def test_crear_receta_con_insumo_repetido(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos):
    azucar = insumos_sellos["Azúcar"]
    response = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        **_receta(unidades_sellos, [{"insumo_id": azucar.id, "cantidad": 1}, {"insumo_id": azucar.id, "cantidad": 2}]),
    }, headers=auth_headers)

    assert response.status_code == 400
    assert response.json()["detail"] == ErrorCode.INSUMO_REPETIDO


def test_crear_receta_con_insumo_inactivo(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos):
    response = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        **_receta(unidades_sellos, [{"insumo_id": insumos_sellos["Colorante"].id, "cantidad": 1}]),
    }, headers=auth_headers)

    assert response.status_code == 400
    assert response.json()["detail"] == ErrorCode.INSUMO_NO_ALIMENTARIO


def test_crear_receta_sin_permiso(client, auth_headers_sin_permiso, producto_solido, unidades_sellos, insumos_sellos):
    response = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        **_receta(unidades_sellos, [{"insumo_id": insumos_sellos["Harina"].id, "cantidad": 100}]),
    }, headers=auth_headers_sin_permiso)

    assert response.status_code == 403


def test_actualizar_receta_genera_nueva_version(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos):
    creada = client.post("/recetas/", json={
        "producto_id": producto_solido.id,
        **_receta(unidades_sellos, [
            {"insumo_id": insumos_sellos["Azúcar"].id, "cantidad": 30},
            {"insumo_id": insumos_sellos["Harina"].id, "cantidad": 70},
        ]),
    }, headers=auth_headers).json()

    response = client.put(f"/recetas/{creada['id']}", json=_receta(unidades_sellos, [
        {"insumo_id": insumos_sellos["Harina"].id, "cantidad": 100},
    ]), headers=auth_headers)
    nueva = response.json()
    anterior = client.get(f"/recetas/{creada['id']}", headers=auth_headers).json()
    vigente = client.get(f"/recetas/producto/{producto_solido.id}", headers=auth_headers).json()

    assert response.status_code == 200
    assert nueva["id"] != creada["id"]
    assert nueva["version"] == 2
    assert nueva["vigente"] is True
    assert [(item["nombre"], item["cantidad"]) for item in nueva["insumos"]] == [("Harina", 100)]
    assert anterior["vigente"] is False
    assert anterior["fecha_hasta_vigencia"] is not None
    assert [(item["nombre"], item["cantidad"]) for item in anterior["insumos"]] == [("Azúcar", 30), ("Harina", 70)]
    assert vigente["id"] == nueva["id"]


def test_listar_versiones_de_receta(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos):
    receta = _receta(unidades_sellos, [{"insumo_id": insumos_sellos["Harina"].id, "cantidad": 100}])
    creada = client.post("/recetas/", json={"producto_id": producto_solido.id, **receta}, headers=auth_headers).json()
    client.put(f"/recetas/{creada['id']}", json=receta, headers=auth_headers)

    response = client.get(f"/recetas/producto/{producto_solido.id}/versiones", headers=auth_headers)

    assert response.status_code == 200
    assert [(version["version"], version["vigente"]) for version in response.json()] == [(2, True), (1, False)]


def test_actualizar_version_anterior_es_solo_lectura(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos):
    receta = _receta(unidades_sellos, [{"insumo_id": insumos_sellos["Harina"].id, "cantidad": 100}])
    creada = client.post("/recetas/", json={"producto_id": producto_solido.id, **receta}, headers=auth_headers).json()
    client.put(f"/recetas/{creada['id']}", json=receta, headers=auth_headers)

    response = client.put(f"/recetas/{creada['id']}", json=receta, headers=auth_headers)
    respuesta_etapa = client.put(f"/etapas-receta/{creada['etapas'][0]['id']}", json={"nombre": "Otra"}, headers=auth_headers)

    assert response.status_code == 409
    assert response.json()["detail"] == ErrorCode.RECETA_SOLO_LECTURA
    assert respuesta_etapa.status_code == 409


def test_evaluar_sellos(client, auth_headers, producto_solido, unidades_sellos, insumos_sellos):
    response = client.post("/recetas/sellos", json={
        "producto_id": producto_solido.id,
        "rendimiento": 1000,
        "rendimiento_unidad_medida_id": unidades_sellos["Gramo"].id,
        "insumos": [{"insumo_id": insumos_sellos["Harina"].id, "cantidad": 1000}],
    }, headers=auth_headers)
    data = response.json()

    assert response.status_code == 200
    assert data["evaluable"] is True
    assert data["cantidad_base"] == 1000
    assert data["valor_energetico"] == 364
    assert data["sellos"] == []


def test_evaluar_sellos_sin_permiso(client, auth_headers_sin_permiso, producto_solido):
    response = client.post("/recetas/sellos", json={"producto_id": producto_solido.id, "insumos": []},
                           headers=auth_headers_sin_permiso)

    assert response.status_code == 403
