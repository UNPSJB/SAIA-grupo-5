import logging
from typing import List
from sqlalchemy import select, update, delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.tarea.models import Tarea
from src.tarea import schemas, exceptions
from src.tareas_ocurrencia.services import generar_ocurrencias_pendientes

logger = logging.getLogger(__name__)

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
    query = select(Tarea)
    if plan_id is not None:
        query = query.where(Tarea.plan_limpieza_id == plan_id)
    return db.scalars(query).all()

def leer_tarea(db: Session, tarea_id: int) -> schemas.Tarea:
    db_tarea = db.scalar(select(Tarea).where(Tarea.id == tarea_id))
    if db_tarea is None:
        raise exceptions.TareaNoEncontrada()
    return db_tarea

def modificar_tarea(db: Session, tarea_id: int, tarea: schemas.TareaUpdate) -> schemas.Tarea:
    db_tarea = leer_tarea(db, tarea_id)
    try:
        db.execute(update(Tarea).where(Tarea.id == tarea_id).values(**tarea.model_dump()))
        db.commit()
    except IntegrityError:
        db.rollback()
        raise exceptions.TareaDatosInvalidos()
    db.refresh(db_tarea)

    # Relevante sobre todo si cambió frecuencia o plan_limpieza_id.
    generar_ocurrencias_pendientes(db)
    db.commit()

    return db_tarea


# TODO: cuando se realice la relación con elemento_limpieza, debería 
# realizarse baja lógica para no perder el historial de consumo de un elemento_limpieza
def eliminar_tarea(db: Session, tarea_id: int) -> schemas.TareaDelete:
    db_tarea = leer_tarea(db, tarea_id)
    db.expunge(db_tarea)  # hard delete
    db.execute(delete(Tarea).where(Tarea.id == tarea_id))
    db.commit()
    return db_tarea
