import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.aditivo import schemas, exceptions
from src.aditivo.constants import ClaseFuncional
from src.aditivo.models import Aditivo

logger = logging.getLogger(__name__)


def crear_aditivo(db: Session, aditivo: schemas.AditivoCreate) -> schemas.Aditivo:
    _validar_unicidad(db, aditivo)
    _aditivo = Aditivo(**aditivo.model_dump(mode="json"))
    db.add(_aditivo)
    db.commit()
    db.refresh(_aditivo)
    return _aditivo

def listar_aditivos(db: Session) -> List[schemas.Aditivo]:
    return db.scalars(select(Aditivo).order_by(Aditivo.clase_funcional, Aditivo.nombre)).all()

def listar_clases_funcionales() -> List[str]:
    return [clase.value for clase in ClaseFuncional]

def leer_aditivo(db: Session, aditivo_id: int) -> schemas.Aditivo:
    db_aditivo = db.get(Aditivo, aditivo_id)
    if db_aditivo is None:
        raise exceptions.AditivoNoEncontrado()
    return db_aditivo

def modificar_aditivo(db: Session, aditivo_id: int, aditivo: schemas.AditivoUpdate) -> schemas.Aditivo:
    db_aditivo = leer_aditivo(db, aditivo_id)
    _validar_unicidad(db, aditivo, aditivo_id)
    for campo, valor in aditivo.model_dump(mode="json").items():
        setattr(db_aditivo, campo, valor)
    db.commit()
    db.refresh(db_aditivo)
    return db_aditivo

def cambiar_estado_aditivo(db: Session, aditivo_id: int) -> schemas.Aditivo:
    db_aditivo = leer_aditivo(db, aditivo_id)
    db_aditivo.activo = not db_aditivo.activo
    db.commit()
    db.refresh(db_aditivo)
    return db_aditivo


def _validar_unicidad(db: Session, aditivo: schemas.AditivoBase, aditivo_id: int | None = None) -> None:
    con_nombre = db.scalar(select(Aditivo).where(Aditivo.nombre == aditivo.nombre, Aditivo.id != aditivo_id))
    if con_nombre is not None:
        raise exceptions.AditivoDuplicado()
    if aditivo.numero_ins is not None:
        con_ins = db.scalar(select(Aditivo).where(Aditivo.numero_ins == aditivo.numero_ins, Aditivo.id != aditivo_id))
        if con_ins is not None:
            raise exceptions.NumeroInsDuplicado()
