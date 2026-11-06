from datetime import date, timedelta

from sqlalchemy import select

from src.notificaciones.constants import TipoNotificacion
from src.notificaciones.models import Notificacion
from src.notificaciones.services import (
    generar_notificacion_calibracion_equipo_individual,
    generar_notificaciones_calibracion_equipos,
    resolver_notificaciones_calibracion_equipo,
)
from src.planesCalibracion.constants import DIAS_ALERTA_CALIBRACION


def test_notifica_plan_proximo_a_vencer(db_session, administrador, crear_plan):
    plan = crear_plan(dias_restantes=10)

    creadas = generar_notificaciones_calibracion_equipos(db_session)

    assert len(creadas) == 1
    notificacion = creadas[0]
    assert notificacion.administrador_id == administrador.id
    assert notificacion.tipo == TipoNotificacion.CALIBRACION_EQUIPO.value
    assert notificacion.entidad == "PlanCalibracion"
    assert notificacion.entidad_id == plan.id
    assert notificacion.titulo == "Calibración vence en 10 días: Termómetro"
    assert notificacion.url == "/planes-calibracion"
    assert notificacion.resuelta is False


def test_notifica_plan_que_vence_manana(db_session, administrador, crear_plan):
    crear_plan(dias_restantes=1)

    creadas = generar_notificaciones_calibracion_equipos(db_session)

    assert len(creadas) == 1
    assert creadas[0].titulo == "Calibración vence en 1 día: Termómetro"


def test_notifica_plan_que_vence_hoy(db_session, administrador, crear_plan):
    crear_plan(dias_restantes=0)

    creadas = generar_notificaciones_calibracion_equipos(db_session)

    assert len(creadas) == 1
    assert creadas[0].titulo == "Calibración vence hoy: Termómetro"


def test_notifica_plan_vencido(db_session, administrador, crear_plan):
    crear_plan(dias_restantes=-5)

    creadas = generar_notificaciones_calibracion_equipos(db_session)

    assert len(creadas) == 1
    assert creadas[0].titulo == "Calibración vencida hace 5 días: Termómetro"


def test_notifica_plan_en_el_limite_de_alerta(db_session, administrador, crear_plan):
    crear_plan(dias_restantes=DIAS_ALERTA_CALIBRACION)

    assert len(generar_notificaciones_calibracion_equipos(db_session)) == 1


def test_no_notifica_plan_fuera_del_limite_de_alerta(db_session, administrador, crear_plan):
    crear_plan(dias_restantes=DIAS_ALERTA_CALIBRACION + 1)

    assert generar_notificaciones_calibracion_equipos(db_session) == []


def test_no_notifica_plan_inactivo(db_session, administrador, crear_plan):
    crear_plan(dias_restantes=10, plan_activo=False)

    assert generar_notificaciones_calibracion_equipos(db_session) == []


def test_no_notifica_equipo_inactivo(db_session, administrador, crear_plan):
    crear_plan(dias_restantes=10, equipo_activo=False)

    assert generar_notificaciones_calibracion_equipos(db_session) == []


# persona es activa pero no administra
def test_notifica_solo_a_administradores_activos(
    db_session, administrador, otro_administrador, administrador_inactivo, persona, crear_plan
):
    crear_plan(dias_restantes=10)

    creadas = generar_notificaciones_calibracion_equipos(db_session)

    assert {n.administrador_id for n in creadas} == {administrador.id, otro_administrador.id}


def test_no_duplica_notificaciones_el_mismo_dia(db_session, administrador, crear_plan):
    crear_plan(dias_restantes=10)

    generar_notificaciones_calibracion_equipos(db_session)
    segunda = generar_notificaciones_calibracion_equipos(db_session)

    assert segunda == []
    assert len(db_session.scalars(select(Notificacion)).all()) == 1


def test_generar_individual(db_session, administrador, crear_plan):
    plan = crear_plan(dias_restantes=10)
    crear_plan(dias_restantes=5, nombre="Balanza")

    creadas = generar_notificacion_calibracion_equipo_individual(db_session, plan.id)

    assert len(creadas) == 1
    assert creadas[0].entidad_id == plan.id


def test_generar_individual_plan_no_existe(db_session, administrador):
    assert generar_notificacion_calibracion_equipo_individual(db_session, 9999) == []


def test_generar_individual_plan_inactivo(db_session, administrador, crear_plan):
    plan = crear_plan(dias_restantes=10, plan_activo=False)

    assert generar_notificacion_calibracion_equipo_individual(db_session, plan.id) == []


def test_generar_individual_equipo_inactivo(db_session, administrador, crear_plan):
    plan = crear_plan(dias_restantes=10, equipo_activo=False)

    assert generar_notificacion_calibracion_equipo_individual(db_session, plan.id) == []


# solo se resuelven las del plan indicado
def test_resolver_notificaciones(db_session, administrador, otro_administrador, crear_plan):
    plan = crear_plan(dias_restantes=10)
    otro_plan = crear_plan(dias_restantes=5, nombre="Balanza")
    generar_notificaciones_calibracion_equipos(db_session)

    resueltas = resolver_notificaciones_calibracion_equipo(db_session, plan.id)

    assert resueltas == 2
    notificaciones = db_session.scalars(select(Notificacion)).all()
    for notificacion in notificaciones:
        assert notificacion.resuelta is (notificacion.entidad_id == plan.id)
        assert (notificacion.resuelta_en is not None) is (notificacion.entidad_id == plan.id)
    assert otro_plan.id in {n.entidad_id for n in notificaciones}


def test_resolver_notificaciones_sin_pendientes(db_session, crear_plan):
    plan = crear_plan(dias_restantes=10)

    assert resolver_notificaciones_calibracion_equipo(db_session, plan.id) == 0


def test_registrar_calibracion_resuelve_la_alerta(client, auth_headers, db_session, crear_plan):
    plan = crear_plan(dias_restantes=-5)
    generar_notificaciones_calibracion_equipos(db_session)

    response = client.post(
        f"/registros-calibracion/plan/{plan.id}",
        json={"observacion": "Calibrado."},
        headers=auth_headers,
    )

    assert response.status_code == 200
    notificaciones = client.get("/notificaciones/", headers=auth_headers).json()
    assert len(notificaciones) == 1
    assert notificaciones[0]["resuelta"] is True


def test_registrar_calibracion_vieja_sin_alerta_previa_notifica(client, auth_headers, crear_plan):
    plan = crear_plan(dias_restantes=50)

    # Con este registro faltan 5 días para vencer
    response = client.post(
        f"/registros-calibracion/plan/{plan.id}",
        json={"fecha": (date.today() - timedelta(days=95)).isoformat()},
        headers=auth_headers,
    )

    assert response.status_code == 200
    notificaciones = client.get("/notificaciones/", headers=auth_headers).json()
    assert len(notificaciones) == 1
    assert notificaciones[0]["titulo"] == "Calibración vence en 5 días: Termómetro"
    assert notificaciones[0]["resuelta"] is False


def test_registrar_calibracion_vieja_con_alerta_previa_no_notifica_el_mismo_dia(
    client, auth_headers, db_session, crear_plan
):
    plan = crear_plan(dias_restantes=0)
    generar_notificaciones_calibracion_equipos(db_session)

    response = client.post(
        f"/registros-calibracion/plan/{plan.id}",
        json={"fecha": (date.today() - timedelta(days=95)).isoformat()},
        headers=auth_headers,
    )

    assert response.status_code == 200
    notificaciones = client.get("/notificaciones/", headers=auth_headers).json()
    assert len(notificaciones) == 1
    assert notificaciones[0]["resuelta"] is True
