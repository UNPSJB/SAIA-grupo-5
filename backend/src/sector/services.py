import logging
from typing import List
from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload
from src.sector.models import Sector
from src.sector import schemas, exceptions
from src.equipos.models import Equipo
from src.equipos import schemas as equipos_schemas
from src.superficies.models import Superficie
from src.superficies import schemas as superficies_schemas

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

# operaciones CRUD para Sector

def crear_sector(db: Session, sector: schemas.SectorCreate) -> schemas.Sector:
    sector_existente = db.scalars(select(Sector).where(Sector.nombre == sector.nombre)).first()

    if sector_existente:
        raise exceptions.SectorDuplicado()


    _sector = Sector(**sector.model_dump())
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

def listar_equipos_por_sector(db: Session, sector_id: int) -> List[equipos_schemas.Equipo]:
    leer_sector(db, sector_id)
    return db.scalars(select(Equipo).where(Equipo.sector_id == sector_id)).all()

def listar_superficies_por_sector(db: Session, sector_id: int) -> List[superficies_schemas.Superficie]:
    leer_sector(db, sector_id)
    return db.scalars(
        select(Superficie)
        .join(Superficie.sectores)
        .where(Sector.id == sector_id)
        .options(selectinload(Superficie.sectores), selectinload(Superficie.planes))
    ).all()

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