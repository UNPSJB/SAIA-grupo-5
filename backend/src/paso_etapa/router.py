import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.paso_etapa import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/pasos-etapa", tags=["pasos-etapa"])


# Rutas para PasoEtapa

@router.post("/", response_model=schemas.PasoEtapa)
def create_paso(paso: schemas.PasoEtapaCreate, db: Session = Depends(get_db)):
    return services.crear_paso(db, paso)

@router.get("/{paso_id}", response_model=schemas.PasoEtapa)
def read_paso(paso_id: int, db: Session = Depends(get_db)):
    return services.leer_paso(db, paso_id)

@router.put("/{paso_id}", response_model=schemas.PasoEtapa)
def update_paso(paso_id: int, paso: schemas.PasoEtapaUpdate, db: Session = Depends(get_db)):
    return services.actualizar_paso(db, paso_id, paso)

# Devuelve todos los pasos de la etapa con el orden ya recalculado
@router.put("/{paso_id}/orden", response_model=list[schemas.PasoEtapa])
def reorder_paso(paso_id: int, datos: schemas.PasoEtapaOrden, db: Session = Depends(get_db)):
    return services.reordenar_pasos(db, paso_id, datos.orden)

@router.delete("/{paso_id}", response_model=schemas.PasoEtapa)
def delete_paso(paso_id: int, db: Session = Depends(get_db)):
    return services.eliminar_paso(db, paso_id)
