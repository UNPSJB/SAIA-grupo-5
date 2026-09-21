import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.sector import schemas, services
from src.equipos import schemas as equipos_schemas

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sectores", tags=["sectores"])


# Rutas para Sectores

@router.post("/", response_model=schemas.Sector)
def create_sector(sector: schemas.SectorCreate, db: Session = Depends(get_db)):
    return services.crear_sector(db, sector)

@router.get("/", response_model=list[schemas.Sector])
def read_sectores(db: Session = Depends(get_db)):
    return services.listar_sectores(db)

@router.get("/{sector_id}", response_model=schemas.Sector)
def read_sector(sector_id: int, db: Session = Depends(get_db)):
    return services.leer_sector(db, sector_id)

@router.get("/{sector_id}/equipos", response_model=list[equipos_schemas.Equipo])
def read_equipos_de_sector(sector_id: int, db: Session = Depends(get_db)):
    return services.listar_equipos_por_sector(db, sector_id)

@router.delete("/{sector_id}", response_model=schemas.SectorDelete)
def delete_sector(sector_id: int, db: Session = Depends(get_db)):
    return services.eliminar_sector(db, sector_id)

@router.put("/{sector_id}", response_model=schemas.Sector)
def update_sector(sector_id: int, sector: schemas.SectorUpdate, db: Session = Depends(get_db)):
    return services.modificar_sector(db, sector_id, sector)