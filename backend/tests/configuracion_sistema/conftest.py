import pytest
from datetime import date, timedelta

from src.sector.models import Sector
from src.equipos.models import Equipo
from src.plan_limpieza.models import PlanLimpieza
from src.planesCalibracion.models import PlanCalibracion


def update_configuracion(client, auth_headers, **cambios):
    response = client.put("/configuracion-sistema/", json=cambios, headers=auth_headers)
    assert response.status_code == 200
    return response.json()


@pytest.fixture
def configuracion_activada(client, auth_headers):
    # Sistema con la vista publica activada sin indicadoress
    return update_configuracion(client, auth_headers, vista_publica_activa=True)


@pytest.fixture
def configuracion_cumplimiento(client, auth_headers):
    # Sistema con la vista publica activada y el indicador de cumplimiento visible
    return update_configuracion(
        client,
        auth_headers,
        vista_publica_activa=True,
        vista_publica_mostrar_cumplimiento=True,
    )


@pytest.fixture
def plan_limpieza(db_session):
    _plan = PlanLimpieza(nombre="Limpieza de cocina", activo=True)
    db_session.add(_plan)
    db_session.commit()
    db_session.refresh(_plan)
    return _plan


@pytest.fixture
def equipo(db_session):
    sector = Sector(nombre="Cocina", activo=True)
    db_session.add(sector)
    db_session.commit()

    _equipo = Equipo(
        nombre="Termómetro de cámara frigorífica",
        categoria="Medición de temperatura",
        ubicacion="Cámara frigorífica",
        estado=True,
        sector_id=sector.id,
    )
    db_session.add(_equipo)
    db_session.commit()
    db_session.refresh(_equipo)
    return _equipo


@pytest.fixture
def plan_calibracion(db_session, equipo):
    # Plan iniciado hace 10 dias con periodicidad de 30 (venciendo en 20)
    _plan = PlanCalibracion(
        equipo_id=equipo.id,
        fecha_inicio=date.today() - timedelta(days=10),
        periodicidad=30,
        estado=True,
    )
    db_session.add(_plan)
    db_session.commit()
    db_session.refresh(_plan)
    return _plan
