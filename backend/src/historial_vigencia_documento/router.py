import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.historial_vigencia_documento import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/historial-vigencia-documento", tags=["historial-vigencia-documento"])


@router.get("/documento/{documento_id}", response_model=list[schemas.HistorialVigencia])
def read_historial_documento(documento_id: int, db: Session = Depends(get_db)):
    return services.listar_historial_por_documento(db, documento_id)