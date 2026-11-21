import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.alergenos import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/alergenos", tags=["alergenos"])

@router.post("/", response_model=schemas.Alergeno)
def create_alergeno(alergeno: schemas.AlergenoCreate, db: Session = Depends(get_db)):
    return services.crear_alergeno(db, alergeno)

@router.get("/", response_model=list[schemas.Alergeno])
def read_alergenos(db: Session = Depends(get_db)):
    return services.listar_alergenos(db)

@router.get("/insumo/{insumo_id}", response_model=schemas.InsumoAlergenosResponse)
def read_alergenos_insumo(insumo_id: int, db: Session = Depends(get_db)):
    return services.leer_alergenos_insumo(db, insumo_id)

@router.put("/insumo/{insumo_id}", response_model=schemas.InsumoAlergenosResponse)
def update_alergenos_insumo(insumo_id: int, datos: schemas.InsumoAlergenosUpdate, db: Session = Depends(get_db)):
    return services.guardar_alergenos_insumo(db, insumo_id, datos)

@router.get("/{alergeno_id}", response_model=schemas.Alergeno)
def read_alergeno(alergeno_id: int, db: Session = Depends(get_db)):
    return services.leer_alergeno(db, alergeno_id)

@router.put("/{alergeno_id}", response_model=schemas.Alergeno)
def update_alergeno(alergeno_id: int, alergeno: schemas.AlergenoUpdate, db: Session = Depends(get_db)):
    return services.modificar_alergeno(db, alergeno_id, alergeno)

@router.patch("/{alergeno_id}/estado", response_model=schemas.Alergeno)
def cambiar_estado_alergeno(alergeno_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_alergeno(db, alergeno_id)
