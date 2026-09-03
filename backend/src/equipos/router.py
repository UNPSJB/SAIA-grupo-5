import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.equipos import schemas, services


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/equipos", tags=["equipos"])

@router.post("/", response_model=schemas.Equipo)
def create_equipo(equipo: schemas.EquipoCreate, db: Session = Depends(get_db)):
    return services.crear_equipo(db, equipo)

@router.get("/", response_model=list[schemas.Equipo])
def read_equipos(db: Session = Depends(get_db)):
    return services.listar_equipos(db)

@router.get("/{equipo_id}", response_model=schemas.Equipo)
def read_equipo(equipo_id: int, db: Session = Depends(get_db)):
    return services.leer_equipo(db, equipo_id)

@router.put("/{equipo_id}", response_model=schemas.Equipo)
def update_equipo(equipo_id: int, equipo: schemas.EquipoUpdate, db: Session = Depends(get_db)):
    return services.modificar_equipo(db, equipo_id, equipo)

@router.delete("/{equipo_id}", response_model=schemas.Equipo)
def delete_equipo(equipo_id: int, db: Session = Depends(get_db)):
    return services.eliminar_equipo(db, equipo_id)
