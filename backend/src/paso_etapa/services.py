import logging
from sqlalchemy.orm import Session
from src.paso_etapa.models import PasoEtapa
from src.paso_etapa import schemas, exceptions
from src.etapa_receta.services import leer_etapa
from src.receta import orden

logger = logging.getLogger(__name__)

# operaciones CRUD para PasoEtapa

def crear_paso(db: Session, paso: schemas.PasoEtapaCreate) -> schemas.PasoEtapa:
    db_etapa = leer_etapa(db, paso.etapa_id)
    db_paso = PasoEtapa(descripcion=paso.descripcion)
    orden.insertar(db_etapa.pasos, db_paso, paso.orden)
    db.commit()
    db.refresh(db_paso)
    return db_paso

def leer_paso(db: Session, paso_id: int) -> schemas.PasoEtapa:
    db_paso = db.get(PasoEtapa, paso_id)
    if db_paso is None:
        raise exceptions.PasoNoEncontrado()
    return db_paso

def actualizar_paso(db: Session, paso_id: int, paso: schemas.PasoEtapaUpdate) -> schemas.PasoEtapa:
    db_paso = leer_paso(db, paso_id)
    db_paso.descripcion = paso.descripcion
    db.commit()
    db.refresh(db_paso)
    return db_paso

# Mueve el paso a la posición indicada y recalcula el orden del resto de la etapa
def reordenar_pasos(db: Session, paso_id: int, nuevo_orden: int) -> list[schemas.PasoEtapa]:
    db_paso = leer_paso(db, paso_id)
    db_etapa = db_paso.etapa
    orden.mover(db_etapa.pasos, db_paso, nuevo_orden)
    db.commit()
    return db_etapa.pasos

def eliminar_paso(db: Session, paso_id: int) -> schemas.PasoEtapa:
    db_paso = leer_paso(db, paso_id)
    db_etapa = db_paso.etapa
    if len(db_etapa.pasos) == 1:
        raise exceptions.PasoUnico()

    db_etapa.pasos.remove(db_paso)
    orden.renumerar(db_etapa.pasos)
    db.commit()
    return db_paso
