import logging
from typing import List
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session
from src.insumos.models import Insumo
from src.insumos import schemas, exceptions

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)


# operaciones CRUD para Insumos

def crear_insumo(db: Session, insumo: schemas.InsumoCreate) -> schemas.Insumo:
    _insumo = Insumo(**insumo.model_dump())
    db.add(_insumo)
    db.commit()
    db.refresh(_insumo)
    return _insumo

def listar_insumos(db: Session) -> List[schemas.Insumo]:
    logger.info("Listando Insumos desde services")  # <- este mensaje se verá por la terminal
    return db.scalars(select(Insumo)).all()

def leer_insumo(db: Session, insumo_id: int) -> schemas.Insumo:
    db_insumo = db.scalar(select(Insumo).where(Insumo.id == insumo_id))
    if db_insumo is None:
        raise exceptions.InsumoNoEncontrado()
    return db_insumo

def eliminar_insumo(db: Session, insumo_id: int) -> schemas.InsumoDelete:
    db_insumo = leer_insumo(db, insumo_id)
    db.execute(delete(Insumo).where(Insumo.id == insumo_id))
    db.commit()
    return db_insumo

def modificar_insumo(db: Session, insumo_id: int, insumo: schemas.InsumoUpdate) -> schemas.Insumo:  # Permite modificar el insumo pero si o si se tienen que enviar todos los campos
    db_insumo = leer_insumo(db, insumo_id)
    db.execute(update(Insumo).where(Insumo.id == insumo_id).values(**insumo.model_dump()))
    db.commit()
    db.refresh(db_insumo)
    return db_insumo