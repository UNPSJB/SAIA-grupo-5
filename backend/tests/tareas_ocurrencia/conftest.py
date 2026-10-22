import pytest
from datetime import date

from src.personal.models import Persona
from src.auth.utils import get_password_hash
from src.plan_limpieza.models import PlanLimpieza
from src.sector.models import Sector
from src.tarea.models import Tarea
from src.tarea.constants import Frecuencia, Prioridad
from src.tareas_ocurrencia.models import TareaOcurrencia
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia


@pytest.fixture
def tarea(db_session):
    # Una tarea activa que nunca generó ocurrencias
    plan = PlanLimpieza(nombre="Limpieza de cocina", activo=True)
    sector = Sector(nombre="Cocina", activo=True)
    db_session.add_all([plan, sector])
    db_session.commit()

    _tarea = Tarea(
        nombre="Lavar pisos",
        frecuencia=Frecuencia.DIARIA,
        prioridad=Prioridad.MEDIA,
        foto_obligatoria=False,
        plan_limpieza_id=plan.id,
        sector_id=sector.id,
        activo=True,
    )
    db_session.add(_tarea)
    db_session.commit()
    db_session.refresh(_tarea)
    return _tarea


@pytest.fixture
def tarea_ocurrencia(db_session):
    _ocurrencia = TareaOcurrencia(
        tarea_nombre_snap="Lavar pisos",
        frecuencia_snap="1",
        prioridad_snap="media",
        foto_obligatoria_snap=False,
        plan_nombre_snap="Limpieza de cocina",
        fecha=date.today(),
        estado=EstadoTareaOcurrencia.PENDIENTE,
    )
    db_session.add(_ocurrencia)
    db_session.commit()
    db_session.refresh(_ocurrencia)
    return _ocurrencia


@pytest.fixture
def otro_operario(db_session):
    _persona = Persona(
        nombre="Pedro",
        apellido="Gomez",
        dni="30333444",
        mail="pedro.gomez@test.com",
        username="pedro_gomez",
        hashed_password=get_password_hash("pedro123"),
        operar=True,
        administrar=False,
        activo=True,
    )
    db_session.add(_persona)
    db_session.commit()
    db_session.refresh(_persona)
    return _persona
