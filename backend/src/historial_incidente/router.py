import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.historial_incidente import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/historial-incidente", tags=["historial-incidente"])

@router.get("/", response_model=list[schemas.HistorialIncidente])
def listar_historial_incidente(incidente_id: int, db: Session = Depends(get_db)):
    return services.listar_historial_de_incidente(db, incidente_id)
