import logging
from typing import List
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from src.sector.models import Sector
from src.sector import schemas, exceptions

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

# operaciones CRUD para Sector

def crear_sector(db: Session, sector: schemas.SectorCreate) -> schemas.Sector:
    sector_existente = db.scalars(select(Sector).where(Sector.nombre == sector.nombre)).first()

    if sector_existente:
        raise exceptions.SectorDuplicado()


    _sector = Sector(**Sector.model_dump())
    db.add(_sector)
    db.commit()
    db.refresh(_sector)
    return _sector

def listar_sectores(db: Session) -> List[schemas.Sector]:
    return db.scalars(select(Sector)).all()

def leer_sector(db: Session, sector_id: int) -> schemas.Sector:
    db_sector = db.scalar(select(Sector).where(Sector.id == sector_id))
    if db_sector is None:
        raise exceptions.SectorNoEncontrado()
    return db_sector

def eliminar_sector(db: Session, sector_id: int) -> schemas.SectorDelete:
    db_sector = leer_sector(db, sector_id)
    db_sector.activo = False
    db.commit()
    db.refresh(db_sector)
    return db_sector

def modificar_sector(db: Session, sector_id: int, sector: schemas.SectorUpdate) -> schemas.Sector:  
    db_sector = leer_sector(db, sector_id)
    db.execute(update(Sector).where(Sector.id == sector_id).values(**sector.model_dump()))
    db.commit()
    db.refresh(db_sector)
    return db_sector