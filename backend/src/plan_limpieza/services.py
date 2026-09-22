import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload
from src.plan_limpieza.models import PlanLimpieza
from src.plan_limpieza import schemas, exceptions
from src.sector.models import Sector
from src.superficies.models import Superficie

logger = logging.getLogger(__name__)

# operaciones CRUD para PlanLimpieza

_EAGER_OPTIONS = (
    selectinload(PlanLimpieza.sectores),
    selectinload(PlanLimpieza.superficies),
    selectinload(PlanLimpieza.equipos),
)

def _get_sectores(db: Session, sector_ids: list[int]) -> List[Sector]:
    if not sector_ids:
        return []
    return db.scalars(select(Sector).where(Sector.id.in_(sector_ids))).all()

def _get_superficies(db: Session, superficie_ids: list[int]) -> List[Superficie]:
    if not superficie_ids:
        return []
    return db.scalars(select(Superficie).where(Superficie.id.in_(superficie_ids))).all()

def crear_plan_limpieza(db: Session, plan: schemas.PlanLimpiezaCreate) -> schemas.PlanLimpieza:
    datos = plan.model_dump(exclude={"sector_ids", "superficie_ids"})
    _plan = PlanLimpieza(**datos)
    _plan.sectores = _get_sectores(db, plan.sector_ids)
    _plan.superficies = _get_superficies(db, plan.superficie_ids)
    db.add(_plan)
    db.commit()
    db.refresh(_plan)
    return _plan

def listar_planes_limpieza(db: Session, sector_id: int | None = None) -> List[schemas.PlanLimpieza]:
    query = select(PlanLimpieza).options(*_EAGER_OPTIONS)
    if sector_id is not None:
        query = query.join(PlanLimpieza.sectores).where(Sector.id == sector_id)
    return db.scalars(query).all()

def leer_plan_limpieza(db: Session, plan_id: int) -> schemas.PlanLimpieza:
    db_plan = db.scalar(
        select(PlanLimpieza).where(PlanLimpieza.id == plan_id).options(*_EAGER_OPTIONS)
    )
    if db_plan is None:
        raise exceptions.PlanLimpiezaNoEncontrado()
    return db_plan

def modificar_plan_limpieza(db: Session, plan_id: int, plan: schemas.PlanLimpiezaUpdate) -> schemas.PlanLimpieza:
    db_plan = leer_plan_limpieza(db, plan_id)
    db_plan.nombre = plan.nombre
    db_plan.descripcion = plan.descripcion
    db_plan.sectores = _get_sectores(db, plan.sector_ids)
    db_plan.superficies = _get_superficies(db, plan.superficie_ids)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def eliminar_plan_limpieza(db: Session, plan_id: int) -> schemas.PlanLimpiezaDelete:
    db_plan = leer_plan_limpieza(db, plan_id)
    try:
        if db_plan.tareas or db_plan.equipos:
            raise exceptions.PlanLimpiezaEnUso()
        db_plan.activo = False
        db.commit()
        db.refresh(db_plan)
    except IntegrityError:
        db.rollback()
        raise exceptions.PlanLimpiezaEnUso()
    return db_plan
