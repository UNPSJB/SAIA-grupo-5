import logging
from typing import List
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from src.superficies.models import Superficie
from src.superficies import schemas, exceptions

logger = logging.getLogger(__name__)

# operaciones CRUD para Superficie

def crear_superficie(db: Session, superficie: schemas.SuperficieCreate) -> schemas.Superficie:
    superficie_existente = db.scalars(
        select(Superficie).where(Superficie.nombre == superficie.nombre)
    ).first()

    if superficie_existente:
        raise exceptions.SuperficieDuplicada()

    _superficie = Superficie(**superficie.model_dump())
    db.add(_superficie)
    db.commit()
    db.refresh(_superficie)
    return _superficie

def listar_superficies(db: Session) -> List[schemas.Superficie]:
    return db.scalars(select(Superficie)).all()

def leer_superficie(db: Session, superficie_id: int) -> schemas.Superficie:
    db_superficie = db.scalar(select(Superficie).where(Superficie.id == superficie_id))
    if db_superficie is None:
        raise exceptions.SuperficieNoEncontrada()
    return db_superficie

def eliminar_superficie(db: Session, superficie_id: int) -> schemas.SuperficieDelete:
    db_superficie = leer_superficie(db, superficie_id)
    db_superficie.activo = False
    db.commit()
    db.refresh(db_superficie)
    return db_superficie

def modificar_superficie(db: Session, superficie_id: int, superficie: schemas.SuperficieUpdate) -> schemas.Superficie:
    db_superficie = leer_superficie(db, superficie_id)
    db.execute(update(Superficie).where(Superficie.id == superficie_id).values(**superficie.model_dump()))
    db.commit()
    db.refresh(db_superficie)
    return db_superficie
