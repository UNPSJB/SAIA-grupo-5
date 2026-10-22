from datetime import date


def test_crear_tarea_ocurrencia(client, auth_headers):
    response = client.post(
        "/tareas-ocurrencia/",
        json={
            "tarea_nombre_snap": "Limpiar mesadas",
            "frecuencia_snap": "1",
            "prioridad_snap": "alta",
            "plan_nombre_snap": "Limpieza de cocina",
            "fecha": date.today().isoformat(),
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["tarea_nombre_snap"] == "Limpiar mesadas"
    assert data["estado"] == "Pendiente"


# error 403
def test_crear_tarea_ocurrencia_sin_permiso(client, auth_headers_sin_permiso):
    response = client.post(
        "/tareas-ocurrencia/",
        json={
            "tarea_nombre_snap": "Limpiar mesadas",
            "frecuencia_snap": "1",
            "prioridad_snap": "alta",
            "plan_nombre_snap": "Limpieza de cocina",
            "fecha": date.today().isoformat(),
        },
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403


def test_leer_tarea_ocurrencia(client, auth_headers, tarea_ocurrencia):
    response = client.get(f"/tareas-ocurrencia/{tarea_ocurrencia.id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == tarea_ocurrencia.id


# error 404
def test_tarea_ocurrencia_no_existe(client, auth_headers):
    response = client.get("/tareas-ocurrencia/9999", headers=auth_headers)

    assert response.status_code == 404


def test_generar_ocurrencias_manual(client, auth_headers, tarea):
    response = client.post("/tareas-ocurrencia/generar-manual", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["tarea_nombre_snap"] == tarea.nombre

    # la tarea ya generó su ocurrencia del día: no se vuelve a generar
    segunda = client.post("/tareas-ocurrencia/generar-manual", headers=auth_headers)
    assert segunda.json() == []


# error 403
def test_generar_ocurrencias_manual_sin_permiso(client, auth_headers_sin_permiso):
    response = client.post("/tareas-ocurrencia/generar-manual", headers=auth_headers_sin_permiso)

    assert response.status_code == 403


def test_completar_tarea_ocurrencia(client, auth_headers_sin_permiso, persona, tarea_ocurrencia):
    response = client.put(
        f"/tareas-ocurrencia/{tarea_ocurrencia.id}/completar",
        json={"operario_id": persona.id, "observacion": "Sin novedades."},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["estado"] == "Completada"
    assert data["operario_id"] == persona.id
    assert data["fecha_completado"] is not None
    assert data["fue_editada"] is False


def test_editar_tarea_ocurrencia_completada(client, auth_headers_sin_permiso, persona, tarea_ocurrencia):
    url = f"/tareas-ocurrencia/{tarea_ocurrencia.id}/completar"
    client.put(url, json={"operario_id": persona.id}, headers=auth_headers_sin_permiso)

    response = client.put(
        url,
        json={"operario_id": persona.id, "observacion": "Corrijo observación."},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["fue_editada"] is True
    assert data["fecha_edicion"] is not None
    assert data["observacion"] == "Corrijo observación."


# error 403 - no se puede editar una tarea completada por otro operario
def test_editar_tarea_ocurrencia_completada_por_otro(
    client, auth_headers_sin_permiso, persona, otro_operario, tarea_ocurrencia
):
    url = f"/tareas-ocurrencia/{tarea_ocurrencia.id}/completar"
    client.put(url, json={"operario_id": persona.id}, headers=auth_headers_sin_permiso)

    response = client.put(url, json={"operario_id": otro_operario.id}, headers=auth_headers_sin_permiso)

    assert response.status_code == 403


# error 404
def test_completar_tarea_ocurrencia_no_existe(client, auth_headers_sin_permiso, persona):
    response = client.put(
        "/tareas-ocurrencia/9999/completar",
        json={"operario_id": persona.id},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 404


def test_listar_pendientes_y_completadas(client, auth_headers, persona, tarea_ocurrencia):
    pendientes = client.get("/tareas-ocurrencia/pendientes", headers=auth_headers)
    data = pendientes.json()
    assert len(data) == 1
    assert data[0]["id"] == tarea_ocurrencia.id

    client.put(
        f"/tareas-ocurrencia/{tarea_ocurrencia.id}/completar",
        json={"operario_id": persona.id},
        headers=auth_headers,
    )

    pendientes = client.get("/tareas-ocurrencia/pendientes", headers=auth_headers)
    completadas = client.get("/tareas-ocurrencia/completadas", headers=auth_headers)
    assert pendientes.json() == []
    data = completadas.json()
    assert len(data) == 1
    assert data[0]["id"] == tarea_ocurrencia.id


def test_historial(client, auth_headers, tarea_ocurrencia):
    hoy = date.today().isoformat()
    response = client.get(
        f"/tareas-ocurrencia/historial?fecha_desde={hoy}&fecha_hasta={hoy}",
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == tarea_ocurrencia.id


# error 403 - el historial es solo para administradores
def test_historial_sin_permiso(client, auth_headers_sin_permiso):
    hoy = date.today().isoformat()
    response = client.get(
        f"/tareas-ocurrencia/historial?fecha_desde={hoy}&fecha_hasta={hoy}",
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403


def test_eliminar_tarea_ocurrencia(client, auth_headers, tarea_ocurrencia):
    response = client.delete(f"/tareas-ocurrencia/{tarea_ocurrencia.id}", headers=auth_headers)

    assert response.status_code == 200

    # es un borrado físico
    consulta = client.get(f"/tareas-ocurrencia/{tarea_ocurrencia.id}", headers=auth_headers)
    assert consulta.status_code == 404


# error 404
def test_eliminar_tarea_ocurrencia_no_existe(client, auth_headers):
    response = client.delete("/tareas-ocurrencia/9999", headers=auth_headers)

    assert response.status_code == 404


# error 403
def test_eliminar_tarea_ocurrencia_sin_permiso(client, auth_headers_sin_permiso, tarea_ocurrencia):
    response = client.delete(f"/tareas-ocurrencia/{tarea_ocurrencia.id}", headers=auth_headers_sin_permiso)

    assert response.status_code == 403
