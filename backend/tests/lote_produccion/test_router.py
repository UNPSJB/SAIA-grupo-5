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
