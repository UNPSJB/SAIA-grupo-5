import pytest
from datetime import date, timedelta

from src.auth.utils import get_password_hash
from src.equipos.models import Equipo
from src.personal.models import Persona
from src.planesCalibracion.models import PlanCalibracion
from src.sector.models import Sector


def _crear_administrador(db_session, username, activo=True):
    _administrador = Persona(
        nombre="Admin",
        apellido=username,
        dni=username,
        mail=f"{username}@test.com",
        username=username,
        hashed_password=get_password_hash("admin123"),
        operar=False,
        administrar=True,
        activo=activo,
    )
    db_session.add(_administrador)
    db_session.commit()
    db_session.refresh(_administrador)
    return _administrador


@pytest.fixture
def administrador(db_session):
    return _crear_administrador(db_session, "admin_uno")


@pytest.fixture
def otro_administrador(db_session):
    return _crear_administrador(db_session, "admin_dos")


@pytest.fixture
def administrador_inactivo(db_session):
    return _crear_administrador(db_session, "admin_baja", activo=False)


@pytest.fixture
def sector(db_session):
    _sector = Sector(nombre="Cocina", activo=True)
    db_session.add(_sector)
    db_session.commit()
    db_session.refresh(_sector)
    return _sector


@pytest.fixture
def crear_plan(db_session, sector):
    # Crea un plan de calibración al que le faltan dias_restantes días para vencer
    def _crear_plan(dias_restantes, plan_activo=True, equipo_activo=True, nombre="Termómetro"):
        equipo = Equipo(
            nombre=nombre,
            categoria="Medición de temperatura",
            ubicacion="Cámara frigorífica",
            estado=equipo_activo,
            sector_id=sector.id,
        )
        db_session.add(equipo)
        db_session.commit()

        plan = PlanCalibracion(
            equipo_id=equipo.id,
            fecha_inicio=date.today() + timedelta(days=dias_restantes - 100),
            periodicidad=100,
            estado=plan_activo,
        )
        db_session.add(plan)
        db_session.commit()
        db_session.refresh(plan)
        return plan

    return _crear_plan
