import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.plan_limpieza.models import PlanLimpieza
from src.plan_limpieza import schemas, exceptions

logger = logging.getLogger(__name__)

# operaciones CRUD para PlanLimpieza

def crear_plan_limpieza(db: Session, plan: schemas.PlanLimpiezaCreate) -> schemas.PlanLimpieza:
    _plan = PlanLimpieza(**plan.model_dump())
    db.add(_plan)
    db.commit()
    db.refresh(_plan)
    return _plan

def listar_planes_limpieza(db: Session) -> List[schemas.PlanLimpieza]:
    return db.scalars(select(PlanLimpieza)).all()

def leer_plan_limpieza(db: Session, plan_id: int) -> schemas.PlanLimpieza:
    db_plan = db.scalar(select(PlanLimpieza).where(PlanLimpieza.id == plan_id))
    if db_plan is None:
        raise exceptions.PlanLimpiezaNoEncontrado()
    return db_plan

def modificar_plan_limpieza(db: Session, plan_id: int, plan: schemas.PlanLimpiezaUpdate) -> schemas.PlanLimpieza:
    db_plan = leer_plan_limpieza(db, plan_id)
    db_plan.nombre = plan.nombre
    db_plan.descripcion = plan.descripcion
    db.commit()
    db.refresh(db_plan)
    return db_plan

def eliminar_plan_limpieza(db: Session, plan_id: int) -> schemas.PlanLimpiezaDelete:
    db_plan = leer_plan_limpieza(db, plan_id)
    try:
        if any(tarea.activo for tarea in db_plan.tareas):
            raise exceptions.PlanLimpiezaEnUso()
        db_plan.activo = False
        db.commit()
        db.refresh(db_plan)
    except IntegrityError:
        db.rollback()
        raise exceptions.PlanLimpiezaEnUso()
    return db_plan

def cambiar_estado_plan_limpieza(db: Session, plan_id: int) -> schemas.PlanLimpieza:
    db_plan = leer_plan_limpieza(db, plan_id)
    db_plan.activo = not db_plan.activo
    db.commit()
    db.refresh(db_plan)
    return db_plan
