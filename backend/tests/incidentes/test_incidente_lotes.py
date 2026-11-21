from src.tipo_incidente.models import TipoIncidente


def test_endpoint_crear_incidente_vinculado_a_lotes(client, auth_headers, db_session, unico_lote_produccion, unico_lote_proveedor):
    tipo = TipoIncidente(nombre="Calidad Lote", descripcion="Desvio en lote", activo=True)
    db_session.add(tipo)
    db_session.commit()
    db_session.refresh(tipo)

    payload = {
        "nombre": "Desvio de temperatura en lote",
        "descripcion": "Se detecto temperatura fuera de rango",
        "tipo_id": tipo.id,
        "lote_produccion_id": unico_lote_produccion.id,
    }
    response = client.post("/incidentes/", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["lote_produccion_id"] == unico_lote_produccion.id
    assert data["lote_proveedor_id"] is None

    payload_invalido = {
        "nombre": "Incidente con multiples vinculos",
        "descripcion": "Invalido",
        "tipo_id": tipo.id,
        "lote_produccion_id": unico_lote_produccion.id,
        "lote_proveedor_id": unico_lote_proveedor.id,
    }
    res_invalida = client.post("/incidentes/", json=payload_invalido, headers=auth_headers)
    assert res_invalida.status_code == 400

    filtro_res = client.get(f"/incidentes?lote_produccion_id={unico_lote_produccion.id}", headers=auth_headers)
    assert filtro_res.status_code == 200
    assert len(filtro_res.json()) == 1


def test_endpoint_crear_incidente_con_lote_inexistente(client, auth_headers, db_session):
    tipo = TipoIncidente(nombre="Calidad Inexistente", descripcion="Prueba", activo=True)
    db_session.add(tipo)
    db_session.commit()
    db_session.refresh(tipo)

    payload = {
        "nombre": "Incidente lote invalido",
        "descripcion": "Prueba",
        "tipo_id": tipo.id,
        "lote_produccion_id": 99999,
    }
    response = client.post("/incidentes/", json=payload, headers=auth_headers)
    assert response.status_code == 404
