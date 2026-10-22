def test_crear_plan_limpieza(client, auth_headers):
    response = client.post(
        "/planes-limpieza/",
        json={"nombre": "Limpieza de depósito", "descripcion": "Plan semanal."},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Limpieza de depósito"
    assert data["activo"] is True


# error 403
def test_crear_plan_limpieza_sin_permiso(client, auth_headers_sin_permiso):
    response = client.post(
        "/planes-limpieza/",
        json={"nombre": "Limpieza de depósito"},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403


def test_leer_plan_limpieza(client, auth_headers, plan_limpieza):
    response = client.get(f"/planes-limpieza/{plan_limpieza.id}", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["id"] == plan_limpieza.id


# error 404
def test_plan_limpieza_no_existe(client, auth_headers):
    response = client.get("/planes-limpieza/9999", headers=auth_headers)

    assert response.status_code == 404


def test_modificar_plan_limpieza(client, auth_headers, plan_limpieza):
    response = client.put(
        f"/planes-limpieza/{plan_limpieza.id}",
        json={"nombre": "Limpieza de cocina (actualizado)", "descripcion": "Nueva descripción."},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["nombre"] == "Limpieza de cocina (actualizado)"


# error 404
def test_modificar_plan_limpieza_no_existe(client, auth_headers):
    response = client.put(
        "/planes-limpieza/9999",
        json={"nombre": "Lo que sea"},
        headers=auth_headers,
    )

    assert response.status_code == 404


# error 403
def test_modificar_plan_limpieza_sin_permiso(client, auth_headers_sin_permiso, plan_limpieza):
    response = client.put(
        f"/planes-limpieza/{plan_limpieza.id}",
        json={"nombre": "Lo que sea"},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403


def test_cambiar_estado_plan_limpieza(client, auth_headers, plan_limpieza):
    response = client.put(f"/planes-limpieza/{plan_limpieza.id}/estado", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["activo"] is False


# error 403
def test_cambiar_estado_plan_limpieza_sin_permiso(client, auth_headers_sin_permiso, plan_limpieza):
    response = client.put(f"/planes-limpieza/{plan_limpieza.id}/estado", headers=auth_headers_sin_permiso)

    assert response.status_code == 403


def test_eliminar_plan_limpieza(client, auth_headers, plan_limpieza):
    response = client.delete(f"/planes-limpieza/{plan_limpieza.id}", headers=auth_headers)

    assert response.status_code == 200

    consulta = client.get(f"/planes-limpieza/{plan_limpieza.id}", headers=auth_headers)
    assert consulta.json()["activo"] is False


# error 404
def test_eliminar_plan_limpieza_no_existe(client, auth_headers):
    response = client.delete("/planes-limpieza/9999", headers=auth_headers)

    assert response.status_code == 404


# error 403
def test_eliminar_plan_limpieza_sin_permiso(client, auth_headers_sin_permiso, plan_limpieza):
    response = client.delete(f"/planes-limpieza/{plan_limpieza.id}", headers=auth_headers_sin_permiso)

    assert response.status_code == 403


# error 400 - no se puede eliminar un plan con tareas activas
def test_eliminar_plan_limpieza_en_uso(client, auth_headers, plan_limpieza_en_uso):
    response = client.delete(f"/planes-limpieza/{plan_limpieza_en_uso.id}", headers=auth_headers)

    assert response.status_code == 400

