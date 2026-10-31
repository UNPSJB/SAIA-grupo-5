from datetime import date
from unittest.mock import MagicMock, patch

from src.exceptions import NotFound, PermissionDenied
from tests.configuracion_sistema.conftest import update_configuracion
from src.registrosCalibracion.models import RegistroCalibracion
from src.tareas_ocurrencia.models import TareaOcurrencia
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia

HOY_FICTICIO = date(2026, 11, 15)


def _fijar_hoy(hoy: date):
    fecha_falsa = MagicMock()
    fecha_falsa.today.return_value = hoy
    return patch("src.configuracion_sistema.publica.date", fecha_falsa)


def _crear_plan_calibracion(db_session, equipo, fecha_inicio: date):
    from src.planesCalibracion.models import PlanCalibracion

    _plan = PlanCalibracion(
        equipo_id=equipo.id,
        fecha_inicio=fecha_inicio,
        periodicidad=30,
        estado=True,
    )
    db_session.add(_plan)
    db_session.commit()
    db_session.refresh(_plan)
    return _plan


def _crear_ocurrencia(db_session, nombre: str, fecha: date, estado: EstadoTareaOcurrencia):
    _ocurrencia = TareaOcurrencia(
        tarea_nombre_snap=nombre,
        frecuencia_snap="1",
        prioridad_snap="media",
        foto_obligatoria_snap=False,
        plan_nombre_snap="Limpieza de cocina",
        fecha=fecha,
        estado=estado,
    )
    db_session.add(_ocurrencia)
    db_session.commit()
    db_session.refresh(_ocurrencia)
    return _ocurrencia


def test_activar_vista_publica_genera_token(client, auth_headers):
    data = update_configuracion(client, auth_headers, vista_publica_activa=True)

    assert data["vista_publica_activa"] is True
    assert data["vista_publica_token"] is not None


def test_reactivar_vista_publica_conserva_token(client, auth_headers):
    data = update_configuracion(client, auth_headers, vista_publica_activa=True)
    token_previo = data["vista_publica_token"]

    reactivada = update_configuracion(client, auth_headers, vista_publica_activa=True)
    assert reactivada["vista_publica_token"] == token_previo


def test_desactivar_vista_publica_elimina_token(client, auth_headers):
    update_configuracion(client, auth_headers, vista_publica_activa=True)

    data = update_configuracion(client, auth_headers, vista_publica_activa=False)

    assert data["vista_publica_activa"] is False
    assert data["vista_publica_token"] is None


def test_actualizar_nombre_establecimiento(client, auth_headers, configuracion_activada):
    data = update_configuracion(
        client, auth_headers, vista_publica_nombre_establecimiento="Hospital General"
    )

    response = client.get(f"/vista-publica/{configuracion_activada['vista_publica_token']}")

    assert response.status_code == 200
    assert data["vista_publica_nombre_establecimiento"] == "Hospital General"
    assert response.json()["establecimiento"] == "Hospital General"


# error 422 - el nombre no puede estar vacío
def test_actualizar_nombre_establecimiento_invalido(client, auth_headers, configuracion_activada):
    response = client.put(
        "/configuracion-sistema/",
        json={"vista_publica_nombre_establecimiento": ""},
        headers=auth_headers,
    )

    assert response.status_code == 422


# error 403
def test_actualizar_vista_publica_sin_permiso(client, auth_headers_sin_permiso):
    response = client.put(
        "/configuracion-sistema/",
        json={"vista_publica_activa": True},
        headers=auth_headers_sin_permiso,
    )

    assert response.status_code == 403
    data = response.json()
    assert data["detail"] == PermissionDenied.DETAIL


# error 401
def test_actualizar_vista_publica_no_autenticado(client):
    response = client.put("/configuracion-sistema/", json={"vista_publica_activa": True})

    assert response.status_code == 401


def test_leer_vista_publica(client, configuracion_activada):
    token = configuracion_activada["vista_publica_token"]
    response = client.get(f"/vista-publica/{token}")

    assert response.status_code == 200
    data = response.json()
    assert data["establecimiento"] == configuracion_activada["vista_publica_nombre_establecimiento"]
    assert data["actualizado"]
    # Sin indicadores activados no devuelve nada más
    assert data["indicadores"] == []


def test_leer_vista_publica_no_requiere_autenticacion(client, configuracion_activada):
    token = configuracion_activada["vista_publica_token"]
    response = client.get(f"/vista-publica/{token}")

    assert response.status_code == 200


def test_leer_vista_publica_sin_cache(client, configuracion_activada):
    token = configuracion_activada["vista_publica_token"]
    response = client.get(f"/vista-publica/{token}")

    assert response.headers["Cache-Control"] == "no-store, private"


# error 404
def test_leer_vista_publica_token_invalido(client):
    response = client.get("/vista-publica/token-inexistente")

    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == NotFound.DETAIL


# error 404 - al desactivar la vista pública el token deja de ser válido
def test_leer_vista_publica_token_desactivado(client, auth_headers):
    data = update_configuracion(client, auth_headers, vista_publica_activa=True)
    token = data["vista_publica_token"]

    update_configuracion(client, auth_headers, vista_publica_activa=False)

    response = client.get(f"/vista-publica/{token}")
    assert response.status_code == 404


# una completada y una vencida dentro del mes es cumplimiento del 50%
def test_indicador_cumplimiento(client, auth_headers, db_session, configuracion_cumplimiento):
    token = configuracion_cumplimiento["vista_publica_token"]
    _crear_ocurrencia(db_session, "Lavar pisos", HOY_FICTICIO, EstadoTareaOcurrencia.COMPLETADA)
    _crear_ocurrencia(db_session, "Limpiar mesadas", date(2026, 11, 13), EstadoTareaOcurrencia.PENDIENTE)

    with _fijar_hoy(HOY_FICTICIO):
        response = client.get(f"/vista-publica/{token}")

    data = response.json()
    assert len(data["indicadores"]) == 1
    indicador = data["indicadores"][0]
    assert indicador["clave"] == "cumplimiento"
    assert indicador["valor"] == "50%"


# sin ocurrencias en el mes no hay indicador de cumplimiento
def test_indicador_cumplimiento_sin_ocurrencias(client, configuracion_cumplimiento):
    token = configuracion_cumplimiento["vista_publica_token"]
    with _fijar_hoy(HOY_FICTICIO):
        response = client.get(f"/vista-publica/{token}")

    assert response.json()["indicadores"] == []


# un plan con calibración al día: 100% de equipos al día, sin demoras no hay tiempo promedio
def test_indicador_calibraciones_al_dia(client, auth_headers, db_session, equipo):
    update_configuracion(
        client,
        auth_headers,
        vista_publica_activa=True,
        vista_publica_mostrar_calibraciones=True,
        vista_publica_mostrar_tiempo_calibracion=True,
    )
    _crear_plan_calibracion(db_session, equipo, fecha_inicio=date(2026, 10, 20))
    token = client.get("/configuracion-sistema/", headers=auth_headers).json()["vista_publica_token"]

    with _fijar_hoy(HOY_FICTICIO):  # vence el 2026-11-19: al dia
        response = client.get(f"/vista-publica/{token}")

    data = response.json()
    assert len(data["indicadores"]) == 1
    indicador = data["indicadores"][0]
    assert indicador["clave"] == "calibraciones"
    assert indicador["valor"] == "100%"


# un registro calibrado 5 días despues de lo programado: tiempo promedio de 5 dias
def test_indicador_tiempo_calibracion(client, auth_headers, db_session, equipo):
    update_configuracion(
        client,
        auth_headers,
        vista_publica_activa=True,
        vista_publica_mostrar_calibraciones=True,
        vista_publica_mostrar_tiempo_calibracion=True,
    )
    plan = _crear_plan_calibracion(db_session, equipo, fecha_inicio=date(2026, 10, 20))
    # programado para el 2026-11-19 (fecha_inicio + periodicidad), se registro el 2026-11-24
    db_session.add(RegistroCalibracion(plan_calibracion_id=plan.id, fecha=date(2026, 11, 24)))
    db_session.commit()
    token = client.get("/configuracion-sistema/", headers=auth_headers).json()["vista_publica_token"]

    with _fijar_hoy(HOY_FICTICIO):
        response = client.get(f"/vista-publica/{token}")

    data = response.json()
    claves = [i["clave"] for i in data["indicadores"]]
    assert "calibraciones" in claves
    tiempo = next(i for i in data["indicadores"] if i["clave"] == "tiempo_calibracion")
    assert tiempo["valor"] == "5 días"


# un plan de limpieza activo: indicador con valor 1
def test_indicador_planes_limpieza(client, auth_headers, plan_limpieza):
    update_configuracion(
        client,
        auth_headers,
        vista_publica_activa=True,
        vista_publica_mostrar_planes_limpieza=True,
    )
    token = client.get("/configuracion-sistema/", headers=auth_headers).json()["vista_publica_token"]

    response = client.get(f"/vista-publica/{token}")

    data = response.json()
    assert len(data["indicadores"]) == 1
    indicador = data["indicadores"][0]
    assert indicador["clave"] == "planes_limpieza"
    assert indicador["valor"] == "1"
