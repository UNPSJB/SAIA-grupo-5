from datetime import date


def test_flujo_completo_supervision_y_avance_lote_router(client, auth_headers, auth_headers_supervisor, unico_lote_con_supervision, multiples_supervisiones_ocurrencia):
    lote_id = unico_lote_con_supervision.id

    res_avance_fallido = client.patch(
        f"/lotes-produccion/{lote_id}/estado",
        json={"observacion": "Intento sin checklist"},
        headers=auth_headers,
    )
    assert res_avance_fallido.status_code == 400

    res_checklist = client.get(
        f"/supervision-lotes/?lote_id={lote_id}",
        headers=auth_headers_supervisor,
    )
    assert res_checklist.status_code == 200
    items = res_checklist.json()
    assert len(items) == len(multiples_supervisiones_ocurrencia)

    for item in items:
        res_completar = client.put(
            f"/supervision-lotes/{item['id']}/completar",
            json={"observacion": "Paso verificado OK"},
            headers=auth_headers_supervisor,
        )
        assert res_completar.status_code == 200
        assert res_completar.json()["estado"] == "Completada"

    res_avance_ok = client.patch(
        f"/lotes-produccion/{lote_id}/estado",
        json={"observacion": "Pasa a empaquetado"},
        headers=auth_headers_supervisor,
    )
    assert res_avance_ok.status_code == 200
    assert res_avance_ok.json()["estado"] == "Empaquetando"

    hoy_str = date.today().isoformat()
    res_historial = client.get(
        f"/supervision-lotes/historial?fecha_desde={hoy_str}&fecha_hasta={hoy_str}&solo_mios=true",
        headers=auth_headers_supervisor,
    )
    assert res_historial.status_code == 200
    assert len(res_historial.json()) >= 2


def test_operario_sin_permiso_supervisor_no_puede_completar_paso(client, auth_headers_sin_permiso, multiples_supervisiones_ocurrencia):
    ocurrencia_id = multiples_supervisiones_ocurrencia[0].id

    res_forbidden = client.put(
        f"/supervision-lotes/{ocurrencia_id}/completar",
        json={"observacion": "No soy supervisor"},
        headers=auth_headers_sin_permiso,
    )
    assert res_forbidden.status_code == 403


def test_put_completar_paso_salteado_devuelve_400(
    client, multiples_supervisiones_ocurrencia, auth_headers_supervisor
):
    segunda_id = multiples_supervisiones_ocurrencia[1].id
    res = client.put(
        f"/supervision-lotes/{segunda_id}/completar",
        json={"observacion": "Salteando paso 1"},
        headers=auth_headers_supervisor,
    )
    assert res.status_code == 400
