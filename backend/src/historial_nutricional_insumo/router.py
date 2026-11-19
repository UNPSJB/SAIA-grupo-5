import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.router_base import PermissionedRouter
from src.historial_nutricional_insumo import schemas, services

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/historial-nutricional", tags=["historial_nutricional"])

@router.get("/info-nutricional/{info_nutricional_id}", response_model=list[schemas.HistorialNutricionalInsumo])
def read_historial_por_info_nutricional(info_nutricional_id: int, db: Session = Depends(get_db)):
    return services.listar_historiales_por_info_nutricional(db, info_nutricional_id)
