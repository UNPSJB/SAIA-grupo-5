from datetime import date, timedelta

from src.exceptions import PermissionDenied
from src.equipos.constants import ErrorCode as EquipoErrorCode
from src.planesCalibracion.constants import ErrorCode
from src.registrosCalibracion.models import RegistroCalibracion


def test_crear_plan_calibracion(client, auth_headers, equipo):
    response = client.post(
        "/planes-calibracion/",
        json={"equipo_id": equipo.id, "periodicidad": 90},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["equipo_id"] == equipo.id
    assert data["estado"] is True
    assert data["fecha_inicio"] == date.today().isoformat()
    assert data["proxima_fecha"] == (date.today() + timedelta(days=90)).isoformat()
    assert data["dias_restantes"] == 90


# error 400 - el equipo ya tiene un plan
def test_crear_plan_calibracion_duplicado(client, auth_headers, plan_calibracion):
    response = client.post(
        "/planes-calibracion/",
        json={"equipo_id": plan_calibracion.equipo_id, "periodicidad": 90},
        headers=auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == ErrorCode.PLAN_DUPLICADO


# error 400 - la fecha de inicio no puede ser futura
def test_crear_plan_calibracion_fecha_futura(client, auth_headers, equipo):
    response = client.post(
        "/planes-calibracion/",
        json={
            "equipo_id": equipo.id,
            "periodicidad": 90,
            "fecha_inicio": (date.today() + timedelta(days=1)).isoformat(),
        },
        headers=auth_headers,
    )

    assert response.status_code == 400
    data = response.json()
    assert data["detail"] == ErrorCode.FECHA_PLAN_CALIBRACION_INVALIDA


# error 404 - el equipo no existe
def test_crear_plan_calibracion_equipo_no_existe(client, auth_headers):
    response = client.post(
        "/planes-calibracion/",
        json={"equipo_id": 9999, "periodicidad": 90},
        headers=auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == EquipoErrorCode.EQUIPO_NO_ENCONTRADO


# error 422 - la periodicidad debe ser mayor a 0
def test_crear_plan_calibracion_periodicidad_invalida(client, auth_headers, equipo):
    response = client.post(
        "/planes-calibracion/",
        json={"equipo_id": equipo.id, "periodicidad": 0},
        headers=auth_headers,
    )

    assert response.status_code == 422


# error 403
def test_crear_plan_calibracion_sin_permiso(client, auth_headers_sin_permiso, equipo):
    response = client.post(
        "/planes-calibracion/",
        json={"equipo_id": equipo.id, "periodicidad": 90},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


def test_leer_plan_calibracion(client, auth_headers, plan_calibracion):
    response = client.get(f"/planes-calibracion/{plan_calibracion.id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == plan_calibracion.id
    assert data["dias_restantes"] == 20


# la próxima fecha se calcula desde el último registro de calibración
def test_leer_plan_calibracion_con_registro(client, auth_headers, db_session, plan_calibracion):
    db_session.add(RegistroCalibracion(plan_calibracion_id=plan_calibracion.id, fecha=date.today()))
    db_session.commit()

    response = client.get(f"/planes-calibracion/{plan_calibracion.id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["proxima_fecha"] == (date.today() + timedelta(days=30)).isoformat()
    assert data["dias_restantes"] == 30


# error 404
def test_plan_calibracion_no_existe(client, auth_headers):
    response = client.get("/planes-calibracion/9999", headers=auth_headers)

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ErrorCode.PLAN_NO_ENCONTRADO


def test_listar_planes_calibracion(client, auth_headers, plan_calibracion):
    response = client.get("/planes-calibracion/", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == plan_calibracion.id


def test_listar_alertas(client, auth_headers, plan_calibracion):
    response = client.get("/planes-calibracion/alertas", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == plan_calibracion.id


# un plan que vence después del umbral de alerta no aparece
def test_listar_alertas_plan_lejano(client, auth_headers, plan_calibracion):
    client.put(
        f"/planes-calibracion/{plan_calibracion.id}",
        json={"periodicidad": 365},
        headers=auth_headers,
    )

    response = client.get("/planes-calibracion/alertas", headers=auth_headers)

    assert response.status_code == 200
    assert response.json() == []


# un plan inactivo no aparece en las alertas
def test_listar_alertas_plan_inactivo(client, auth_headers, plan_calibracion):
    client.patch(f"/planes-calibracion/{plan_calibracion.id}/estado", headers=auth_headers)

    response = client.get("/planes-calibracion/alertas", headers=auth_headers)

    assert response.status_code == 200
    assert response.json() == []


def test_modificar_plan_calibracion(client, auth_headers, plan_calibracion):
    response = client.put(
        f"/planes-calibracion/{plan_calibracion.id}",
        json={"periodicidad": 60},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["periodicidad"] == 60
    assert data["dias_restantes"] == 50


# error 404
def test_modificar_plan_calibracion_no_existe(client, auth_headers):
    response = client.put(
        "/planes-calibracion/9999",
        json={"periodicidad": 60},
        headers=auth_headers,
    )

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ErrorCode.PLAN_NO_ENCONTRADO


# error 403
def test_modificar_plan_calibracion_sin_permiso(client, auth_headers_sin_permiso, plan_calibracion):
    response = client.put(
        f"/planes-calibracion/{plan_calibracion.id}",
        json={"periodicidad": 60},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


def test_cambiar_estado_plan_calibracion(client, auth_headers, plan_calibracion):
    response = client.patch(f"/planes-calibracion/{plan_calibracion.id}/estado", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["estado"] is False


# error 404
def test_cambiar_estado_plan_calibracion_no_existe(client, auth_headers):
    response = client.patch("/planes-calibracion/9999/estado", headers=auth_headers)

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == ErrorCode.PLAN_NO_ENCONTRADO


# error 403
def test_cambiar_estado_plan_calibracion_sin_permiso(client, auth_headers_sin_permiso, plan_calibracion):
    response = client.patch(
        f"/planes-calibracion/{plan_calibracion.id}/estado",
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL
