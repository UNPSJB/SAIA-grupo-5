import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload
from src.tarea.models import Tarea
from src.tarea import schemas, exceptions
from src.tareas_ocurrencia.services import generar_ocurrencias_pendientes

logger = logging.getLogger(__name__)

_EAGER_OPTIONS = (
    selectinload(Tarea.sector),
    selectinload(Tarea.superficie),
    selectinload(Tarea.equipo),
)

# operaciones CRUD para Tarea

def crear_tarea(db: Session, tarea: schemas.TareaCreate) -> schemas.Tarea:
    _tarea = Tarea(**tarea.model_dump())
    db.add(_tarea)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise exceptions.TareaDatosInvalidos()
    db.refresh(_tarea)

    generar_ocurrencias_pendientes(db)
    db.commit()

    return _tarea

def listar_tareas(db: Session, plan_id: int | None = None) -> List[schemas.Tarea]:
    query = select(Tarea).options(*_EAGER_OPTIONS)
    if plan_id is not None:
        query = query.where(Tarea.plan_limpieza_id == plan_id)
    return db.scalars(query).all()

def listar_tareas_de_sector_por_plan(db: Session, plan_id: int) -> List[schemas.Tarea]:
    query = (
        select(Tarea)
        .where(Tarea.plan_limpieza_id == plan_id, Tarea.sector_id.isnot(None))
        .options(*_EAGER_OPTIONS)
    )
    return db.scalars(query).all()

def listar_tareas_de_superficie_por_plan(db: Session, plan_id: int) -> List[schemas.Tarea]:
    query = (
        select(Tarea)
        .where(Tarea.plan_limpieza_id == plan_id, Tarea.superficie_id.isnot(None))
        .options(*_EAGER_OPTIONS)
    )
    return db.scalars(query).all()

def listar_tareas_de_equipo_por_plan(db: Session, plan_id: int) -> List[schemas.Tarea]:
    query = (
        select(Tarea)
        .where(Tarea.plan_limpieza_id == plan_id, Tarea.equipo_id.isnot(None))
        .options(*_EAGER_OPTIONS)
    )
    return db.scalars(query).all()

def leer_tarea(db: Session, tarea_id: int) -> schemas.Tarea:
    db_tarea = db.scalar(select(Tarea).where(Tarea.id == tarea_id).options(*_EAGER_OPTIONS))
    if db_tarea is None:
        raise exceptions.TareaNoEncontrada()
    return db_tarea

def modificar_tarea(db: Session, tarea_id: int, tarea: schemas.TareaUpdate) -> schemas.Tarea:
    db_tarea = leer_tarea(db, tarea_id)
    for campo, valor in tarea.model_dump().items():
        setattr(db_tarea, campo, valor)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise exceptions.TareaDatosInvalidos()
    db.refresh(db_tarea)

    # Relevante sobre todo si cambió frecuencia o plan_limpieza_id.
    generar_ocurrencias_pendientes(db)
    db.commit()

    return db_tarea


def eliminar_tarea(db: Session, tarea_id: int) -> schemas.TareaDelete:
    db_tarea = leer_tarea(db, tarea_id)
    db_tarea.activo = False
    db.commit()
    db.refresh(db_tarea)
    return db_tarea
