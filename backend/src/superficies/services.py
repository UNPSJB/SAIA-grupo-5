import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from src.superficies.models import Superficie
from src.superficies import schemas, exceptions
from src.sector.models import Sector

logger = logging.getLogger(__name__)

# operaciones CRUD para Superficie

def _resolver_sectores(db: Session, sector_ids: list[int]) -> List[Sector]:
    if not sector_ids:
        return []
    return db.scalars(select(Sector).where(Sector.id.in_(sector_ids))).all()

def crear_superficie(db: Session, superficie: schemas.SuperficieCreate) -> schemas.Superficie:
    superficie_existente = db.scalars(
        select(Superficie).where(Superficie.nombre == superficie.nombre)
    ).first()

    if superficie_existente:
        raise exceptions.SuperficieDuplicada()

    datos = superficie.model_dump(exclude={"sector_ids"})
    _superficie = Superficie(**datos)
    _superficie.sectores = _resolver_sectores(db, superficie.sector_ids)
    db.add(_superficie)
    db.commit()
    db.refresh(_superficie)
    return _superficie

def listar_superficies(db: Session) -> List[schemas.Superficie]:
    return db.scalars(
        select(Superficie).options(selectinload(Superficie.sectores))
    ).all()

def leer_superficie(db: Session, superficie_id: int) -> schemas.Superficie:
    db_superficie = db.scalar(
        select(Superficie)
        .where(Superficie.id == superficie_id)
        .options(selectinload(Superficie.sectores))
    )
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
    db_superficie.nombre = superficie.nombre
    db_superficie.tipo_contacto = superficie.tipo_contacto
    db_superficie.sectores = _resolver_sectores(db, superficie.sector_ids)
    db.commit()
    db.refresh(db_superficie)
    return db_superficie
