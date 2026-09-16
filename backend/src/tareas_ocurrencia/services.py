import logging
from datetime import date
from typing import List
from sqlalchemy import select, update, delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.tareas_ocurrencia.models import TareaOcurrencia
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia
from src.tareas_ocurrencia import schemas, exceptions

logger = logging.getLogger(__name__)

# operaciones CRUD para TareaOcurrencia

def crear_tarea_ocurrencia(db: Session, ocurrencia: schemas.TareaOcurrenciaCreate) -> schemas.TareaOcurrencia:
    _ocurrencia = TareaOcurrencia(**ocurrencia.model_dump())
    db.add(_ocurrencia)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise exceptions.TareaOcurrenciaDatosInvalidos()
    db.refresh(_ocurrencia)
    return _ocurrencia

def listar_tareas_ocurrencia(db: Session) -> List[schemas.TareaOcurrencia]:
    return db.scalars(select(TareaOcurrencia)).all()

def leer_tarea_ocurrencia(db: Session, ocurrencia_id: int) -> schemas.TareaOcurrencia:
    db_ocurrencia = db.scalar(select(TareaOcurrencia).where(TareaOcurrencia.id == ocurrencia_id))
    if db_ocurrencia is None:
        raise exceptions.TareaOcurrenciaNoEncontrada()
    return db_ocurrencia

def completar_tarea_ocurrencia(
    db: Session, ocurrencia_id: int, datos: schemas.TareaOcurrenciaCompletar
) -> schemas.TareaOcurrencia:
    db_ocurrencia = leer_tarea_ocurrencia(db, ocurrencia_id)
    db.execute(
        update(TareaOcurrencia)
        .where(TareaOcurrencia.id == ocurrencia_id)
        .values(
            operario_id=datos.operario_id,
            estado=EstadoTareaOcurrencia.COMPLETADA,
            fecha_completado=date.today(),
        )
    )
    db.commit()
    db.refresh(db_ocurrencia)
    return db_ocurrencia

def eliminar_tarea_ocurrencia(db: Session, ocurrencia_id: int) -> schemas.TareaOcurrencia:
    db_ocurrencia = leer_tarea_ocurrencia(db, ocurrencia_id)
    db.expunge(db_ocurrencia)  # hard delete
    db.execute(delete(TareaOcurrencia).where(TareaOcurrencia.id == ocurrencia_id))
    db.commit()
    return db_ocurrencia
