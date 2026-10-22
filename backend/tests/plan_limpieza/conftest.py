import pytest

from src.plan_limpieza.models import PlanLimpieza
from src.sector.models import Sector
from src.tarea.models import Tarea
from src.tarea.constants import Frecuencia, Prioridad


@pytest.fixture
def plan_limpieza(db_session):
    _plan = PlanLimpieza(
        nombre="Limpieza de cocina",
        descripcion="Plan de limpieza diaria de la cocina.",
        activo=True,
    )
    db_session.add(_plan)
    db_session.commit()
    db_session.refresh(_plan)
    return _plan


@pytest.fixture
def plan_limpieza_en_uso(db_session, plan_limpieza):
    # Un plan con una tarea activa: no se puede eliminar.
    sector = Sector(nombre="Cocina", activo=True)
    db_session.add(sector)
    db_session.commit()

    tarea = Tarea(
        nombre="Lavar pisos",
        frecuencia=Frecuencia.DIARIA,
        prioridad=Prioridad.MEDIA,
        foto_obligatoria=False,
        plan_limpieza_id=plan_limpieza.id,
        sector_id=sector.id,
        activo=True,
    )
    db_session.add(tarea)
    db_session.commit()

    return plan_limpieza
