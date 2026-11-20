import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.dependencies import get_current_persona
from src.auth.router_base import PermissionedRouter
from src.informacion_nutricional_insumo import schemas, services

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/informaciones-nutricionales", tags=["informaciones_nutricionales"])

@router.post("/", response_model=schemas.InfoNutricional)
def create_info_nutricional(info_nutricional: schemas.InfoNutricionalCreate, persona=Depends(get_current_persona), db: Session = Depends(get_db)):
    return services.cargar_info_nutricional(db, info_nutricional, persona)

@router.get("/{info_nutricional_id}", response_model=schemas.InfoNutricional)
def read_info_nutricional(info_nutricional_id: int,  db: Session = Depends(get_db)):
    return services.leer_info_nutricional(db, info_nutricional_id)

@router.put("/{info_nutricional_id}", response_model=schemas.InfoNutricional)
def update_info_nutricional(info_nutricional_id: int, info_nutricional: schemas.InfoNutricionalUpdate, persona=Depends(get_current_persona), db: Session = Depends(get_db)):
    return services.modificar_info_nutricional(db, info_nutricional_id, info_nutricional, persona)

@router.get("/insumo/{insumo_id}", response_model=schemas.InfoNutricional)
def read_info_nutricional_por_insumo(insumo_id: int,  db: Session = Depends(get_db)):
    return services.leer_info_nutricional_por_insumo(db, insumo_id)

