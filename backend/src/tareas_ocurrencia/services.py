import logging
from datetime import date
from typing import List
from sqlalchemy import select, update, delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.plan_limpieza.services import leer_plan_limpieza
from src.tareas_ocurrencia.models import TareaOcurrencia
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia
from src.tareas_ocurrencia import schemas, exceptions
from src.tarea.models import Tarea

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

def listar_tareas_ocurrencia_pendientes(db: Session) -> List[schemas.TareaOcurrencia]:
    return db.scalars(
        select(TareaOcurrencia).where(TareaOcurrencia.estado == EstadoTareaOcurrencia.PENDIENTE)
    ).all()

def listar_tareas_ocurrencia_completadas(db: Session) -> List[schemas.TareaOcurrencia]:
    return db.scalars(
        select(TareaOcurrencia).where(TareaOcurrencia.estado == EstadoTareaOcurrencia.COMPLETADA)
    ).all()

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


################ generación automática de ocurrencias a partir de Tarea ########################

def corresponde_generar(tarea: Tarea, hoy: date) -> bool:
    if tarea.ultima_generacion is None:
        return True
    return (hoy - tarea.ultima_generacion).days >= tarea.frecuencia


def generar_ocurrencias_pendientes(db: Session) -> list[TareaOcurrencia]:
    hoy = date.today()
    tareas = db.scalars(select(Tarea)).all()

    generadas = []
    for tarea in tareas:
        try:
            if not corresponde_generar(tarea, hoy):
                continue

            ocurrencia = TareaOcurrencia(
                tarea_id_origen=tarea.id,
                plan_id_origen=tarea.plan_limpieza_id,
                tarea_nombre_snap=tarea.nombre,
                tarea_descripcion_snap=tarea.descripcion,
                frecuencia_snap=str(tarea.frecuencia),
                plan_nombre_snap=tarea.plan_limpieza.nombre,
                fecha=hoy,
                estado=EstadoTareaOcurrencia.PENDIENTE,
            )
            db.add(ocurrencia)
            tarea.ultima_generacion = hoy
            generadas.append(ocurrencia)
        except Exception:
            logger.exception(f"Error generando TareaOcurrencia para Tarea id={tarea.id}")
            continue

    db.flush()
    return generadas


def generar_ocurrencias_manual(db: Session) -> list[TareaOcurrencia]:
    generadas = generar_ocurrencias_pendientes(db)
    db.commit()
    return generadas


# checklist del día, para un plan de limpieza puntual

def obtener_checklist(db: Session, plan_id: int, fecha: date | None = None) -> list[schemas.TareaOcurrencia]:
    plan = leer_plan_limpieza(db, plan_id)
    
    fecha = fecha or date.today()
    
    # checklist ese día. 
    return db.scalars(
        select(TareaOcurrencia).where(
            TareaOcurrencia.plan_id_origen == plan.id,
            TareaOcurrencia.fecha == fecha,
            TareaOcurrencia.estado == EstadoTareaOcurrencia.PENDIENTE,
        )
    ).all()
