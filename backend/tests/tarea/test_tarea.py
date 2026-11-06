from unittest.mock import patch

from src.exceptions import PermissionDenied
from src.configuracion_sistema.services import obtener_o_crear_configuracion
from src.tarea.models import Tarea
from src.tarea.constants import ErrorCode


def test_crear_tarea(client, auth_headers, plan_limpieza, sector):
    response = client.post(
        "/tareas/",
        json={
            "nombre": "Limpiar mesadas",
            "frecuencia": 1,
            "prioridad": "alta",
            "plan_limpieza_id": plan_limpieza.id,
            "sector_id": sector.id,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Limpiar mesadas"
    assert data["activo"] is True
    assert data["sector"]["id"] == sector.id


def _configurar_hora_generacion(db_session, hora: int, minuto: int):
    configuracion = obtener_o_crear_configuracion(db_session)
    configuracion.hora_generacion_checklists = hora
    configuracion.minuto_generacion_checklists = minuto
    db_session.commit()


# al crear una tarea después del horario de generación se genera su primera ocurrencia
def test_crear_tarea_genera_ocurrencia(client, auth_headers, db_session, plan_limpieza, sector):
    _configurar_hora_generacion(db_session, 0, 0)
    client.post(
        "/tareas/",
        json={
            "nombre": "Limpiar mesadas",
            "frecuencia": 1,
            "prioridad": "alta",
            "plan_limpieza_id": plan_limpieza.id,
            "sector_id": sector.id,
        },
        headers=auth_headers,
    )

    response = client.get("/tareas-ocurrencia/pendientes", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["tarea_nombre_snap"] == "Limpiar mesadas"


# error 403
# antes del horario de generación no se genera nada: lo hace el scheduler a la hora configurada
def test_crear_tarea_antes_del_horario_no_genera_ocurrencias(client, auth_headers, db_session, plan_limpieza, sector, tarea):
    with patch("src.tarea.services.ya_paso_hora_generacion", return_value=False):
        client.post(
            "/tareas/",
            json={
                "nombre": "Limpiar mesadas",
                "frecuencia": 1,
                "prioridad": "alta",
                "plan_limpieza_id": plan_limpieza.id,
                "sector_id": sector.id,
            },
            headers=auth_headers,
        )

    response = client.get("/tareas-ocurrencia/pendientes", headers=auth_headers)
    assert response.json() == []

    # la tarea que ya existía sigue pendiente de generar para el scheduler
    assert db_session.get(Tarea, tarea.id).ultima_generacion is None


# después del horario solo se genera la ocurrencia de la tarea creada, no la de las demás
def test_crear_tarea_solo_genera_su_ocurrencia(client, auth_headers, db_session, plan_limpieza, sector, tarea):
    _configurar_hora_generacion(db_session, 0, 0)
    client.post(
        "/tareas/",
        json={
            "nombre": "Limpiar mesadas",
            "frecuencia": 1,
            "prioridad": "alta",
            "plan_limpieza_id": plan_limpieza.id,
            "sector_id": sector.id,
        },
        headers=auth_headers,
    )

    response = client.get("/tareas-ocurrencia/pendientes", headers=auth_headers)
    data = response.json()
    assert [o["tarea_nombre_snap"] for o in data] == ["Limpiar mesadas"]

    assert db_session.get(Tarea, tarea.id).ultima_generacion is None


def test_crear_tarea_sin_permiso(client, auth_headers_sin_permiso, plan_limpieza, sector):
    response = client.post(
        "/tareas/",
        json={
            "nombre": "Limpiar mesadas",
            "frecuencia": 1,
            "prioridad": "alta",
            "plan_limpieza_id": plan_limpieza.id,
            "sector_id": sector.id,
        },
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


# error 422 - la tarea debe ser de un sector, una superficie o un equipo
def test_crear_tarea_sin_relacion(client, auth_headers, plan_limpieza):
    response = client.post(
        "/tareas/",
        json={
            "nombre": "Limpiar mesadas",
            "frecuencia": 1,
            "prioridad": "alta",
            "plan_limpieza_id": plan_limpieza.id,
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


# error 422
def test_crear_tarea_frecuencia_invalida(client, auth_headers, plan_limpieza, sector):
    response = client.post(
        "/tareas/",
        json={
            "nombre": "Limpiar mesadas",
            "frecuencia": 3,
            "prioridad": "alta",
            "plan_limpieza_id": plan_limpieza.id,
            "sector_id": sector.id,
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_leer_tarea(client, auth_headers, tarea):
    response = client.get(f"/tareas/{tarea.id}", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["id"] == tarea.id


# error 404
def test_tarea_no_existe(client, auth_headers):
    response = client.get("/tareas/9999", headers=auth_headers)

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ErrorCode.TAREA_NO_ENCONTRADA


def test_listar_tareas_por_plan(client, auth_headers, tarea):
    response = client.get(f"/tareas/?plan_id={tarea.plan_limpieza_id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == tarea.id


    otro_plan = client.get("/tareas/?plan_id=9999", headers=auth_headers)
    assert otro_plan.json() == []


def test_modificar_tarea(client, auth_headers, tarea):
    response = client.put(
        f"/tareas/{tarea.id}",
        json={
            "nombre": "Lavar pisos (actualizado)",
            "frecuencia": 7,
            "prioridad": "baja",
            "plan_limpieza_id": tarea.plan_limpieza_id,
            "sector_id": tarea.sector_id,
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == "Lavar pisos (actualizado)"
    assert data["frecuencia"] == 7


# error 404
def test_modificar_tarea_no_existe(client, auth_headers, plan_limpieza, sector):
    response = client.put(
        "/tareas/9999",
        json={
            "nombre": "Lo que sea",
            "frecuencia": 1,
            "prioridad": "media",
            "plan_limpieza_id": plan_limpieza.id,
            "sector_id": sector.id,
        },
        headers=auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ErrorCode.TAREA_NO_ENCONTRADA


# error 403
def test_modificar_tarea_sin_permiso(client, auth_headers_sin_permiso, tarea):
    response = client.put(
        f"/tareas/{tarea.id}",
        json={
            "nombre": "Lo que sea",
            "frecuencia": 1,
            "prioridad": "media",
            "plan_limpieza_id": tarea.plan_limpieza_id,
            "sector_id": tarea.sector_id,
        },
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


def test_cambiar_estado_tarea(client, auth_headers, tarea):
    response = client.put(f"/tareas/{tarea.id}/estado", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["activo"] is False


# error 403
def test_cambiar_estado_tarea_sin_permiso(client, auth_headers_sin_permiso, tarea):
    response = client.put(f"/tareas/{tarea.id}/estado", headers=auth_headers_sin_permiso)

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


def test_eliminar_tarea(client, auth_headers, tarea):
    response = client.delete(f"/tareas/{tarea.id}", headers=auth_headers)

    assert response.status_code == 200

    consulta = client.get(f"/tareas/{tarea.id}", headers=auth_headers)
    assert consulta.json()["activo"] is False


# error 404
def test_eliminar_tarea_no_existe(client, auth_headers):
    response = client.delete("/tareas/9999", headers=auth_headers)

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ErrorCode.TAREA_NO_ENCONTRADA


# error 403
def test_eliminar_tarea_sin_permiso(client, auth_headers_sin_permiso, tarea):
    response = client.delete(f"/tareas/{tarea.id}", headers=auth_headers_sin_permiso)

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL
