from src.auth.utils import get_password_hash
from src.equipos.models import Equipo
from src.notificaciones.constants import TipoNotificacion
from src.notificaciones.models import Notificacion
from src.personal.models import Persona
from src.sector.models import Sector
from sqlalchemy import select


def _crear_sector_y_equipo_frio(db_session):
    sector = Sector(nombre="Deposito Frio", activo=True)
    db_session.add(sector)
    db_session.flush()

    equipo = Equipo(
        nombre="Camara Frigorifica 1",
        categoria="Refrigeracion",
        ubicacion="Ala Norte",
        estado=True,
        sector_id=sector.id,
        controla_temperatura=True,
        temperatura_minima=0.0,
        temperatura_maxima=5.0,
    )
    db_session.add(equipo)
    db_session.commit()
    db_session.refresh(equipo)
    return equipo


def test_registrar_temperatura_en_rango(client, db_session, auth_headers):
    equipo = _crear_sector_y_equipo_frio(db_session)

    response = client.post(
        "/registros-temperatura/",
        json={"equipo_id": equipo.id, "temperatura_registrada": 3.5},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["fuera_de_rango"] is False
    assert data["temperatura_registrada"] == 3.5


def test_registrar_temperatura_fuera_rango_sin_accion_falla(client, db_session, auth_headers):
    equipo = _crear_sector_y_equipo_frio(db_session)

    response = client.post(
        "/registros-temperatura/",
        json={"equipo_id": equipo.id, "temperatura_registrada": 9.0},
        headers=auth_headers,
    )

    assert response.status_code == 400


def test_registrar_temperatura_fuera_rango_crea_notificacion(client, db_session, auth_headers):
    equipo = _crear_sector_y_equipo_frio(db_session)

    response = client.post(
        "/registros-temperatura/",
        json={
            "equipo_id": equipo.id,
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
            Notificacion.entidad_id == equipo.id))
    
    assert notificacion is not None


def test_equipos_pendientes_hoy(client, db_session, auth_headers):
    equipo = _crear_sector_y_equipo_frio(db_session)

    res_antes = client.get("/registros-temperatura/pendientes-hoy", headers=auth_headers)
    assert res_antes.status_code == 200
    assert any(item["id"] == equipo.id for item in res_antes.json())

    client.post(
        "/registros-temperatura/",
        json={"equipo_id": equipo.id, "temperatura_registrada": 2.0},
        headers=auth_headers,
    )

    res_despues = client.get("/registros-temperatura/pendientes-hoy", headers=auth_headers)
    assert res_despues.status_code == 200
    assert all(item["id"] != equipo.id for item in res_despues.json())


def test_supervisor_puede_registrar_temperatura(client, db_session):
    equipo = _crear_sector_y_equipo_frio(db_session)

    supervisor = Persona(
        nombre="Sup",
        apellido="Calidad",
        dni="99887766",
        mail="sup@test.com",
        username="sup_temp",
        hashed_password=get_password_hash("1234"),
        operar=False,
        administrar=False,
        supervisor=True,
        activo=True,
    )
    db_session.add(supervisor)
    db_session.commit()
    db_session.refresh(supervisor)

    res = client.post("/auth/token", data={"username": "sup_temp", "password": "1234"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/registros-temperatura/",
        json={"equipo_id": equipo.id, "temperatura_registrada": 2.5},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["fuera_de_rango"] is False
