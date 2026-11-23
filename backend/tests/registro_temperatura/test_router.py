from sqlalchemy import select
from src.notificaciones.constants import TipoNotificacion
from src.notificaciones.models import Notificacion


def test_registrar_temperatura_en_rango(client, auth_headers, unico_equipo_frio):
    response = client.post(
        "/registros-temperatura/",
        json={"equipo_id": unico_equipo_frio.id, "temperatura_registrada": 3.5},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["fuera_de_rango"] is False
    assert data["temperatura_registrada"] == 3.5


def test_registrar_temperatura_fuera_rango_sin_accion_falla(client, auth_headers, unico_equipo_frio):
    response = client.post(
        "/registros-temperatura/",
        json={"equipo_id": unico_equipo_frio.id, "temperatura_registrada": 9.0},
        headers=auth_headers,
    )

    assert response.status_code == 400


def test_registrar_temperatura_fuera_rango_crea_notificacion(client, db_session, auth_headers, unico_equipo_frio):
    response = client.post(
        "/registros-temperatura/",
        json={
            "equipo_id": unico_equipo_frio.id,
            "temperatura_registrada": 9.0,
            "accion_tomada": "Se llamo al tecnico y se traslado la mercaderia.",
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["fuera_de_rango"] is True

    notificacion = db_session.scalar(
        select(Notificacion).where(
            Notificacion.tipo == TipoNotificacion.TEMPERATURA_FUERA_RANGO.value,
            Notificacion.entidad_id == unico_equipo_frio.id,
        )
    )
    assert notificacion is not None


def test_equipos_pendientes_hoy(client, auth_headers, unico_equipo_frio):
    res_antes = client.get("/registros-temperatura/pendientes-hoy", headers=auth_headers)
    assert res_antes.status_code == 200
    assert any(item["id"] == unico_equipo_frio.id for item in res_antes.json())

    client.post(
        "/registros-temperatura/",
        json={"equipo_id": unico_equipo_frio.id, "temperatura_registrada": 2.0},
        headers=auth_headers,
    )

    res_despues = client.get("/registros-temperatura/pendientes-hoy", headers=auth_headers)
    assert res_despues.status_code == 200
    assert all(item["id"] != unico_equipo_frio.id for item in res_despues.json())


def test_supervisor_puede_registrar_temperatura(client, auth_headers_supervisor, unico_equipo_frio):
    response = client.post(
        "/registros-temperatura/",
        json={"equipo_id": unico_equipo_frio.id, "temperatura_registrada": 2.5},
        headers=auth_headers_supervisor,
    )
    assert response.status_code == 200
    assert response.json()["fuera_de_rango"] is False
