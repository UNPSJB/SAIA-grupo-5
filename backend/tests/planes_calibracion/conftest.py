import pytest
from datetime import date, timedelta

from src.sector.models import Sector
from src.equipos.models import Equipo
from src.planesCalibracion.models import PlanCalibracion


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
    # Plan iniciado hace 10 días con periodicidad de 30: vence en 20 días.
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
