import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.etapa_receta import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/etapas-receta", tags=["etapas-receta"])


# Rutas para EtapaReceta

@router.post("/", response_model=schemas.EtapaReceta)
def create_etapa(etapa: schemas.EtapaRecetaCreate, db: Session = Depends(get_db)):
    return services.crear_etapa(db, etapa)

@router.get("/{etapa_id}", response_model=schemas.EtapaReceta)
def read_etapa(etapa_id: int, db: Session = Depends(get_db)):
    return services.leer_etapa(db, etapa_id)

@router.put("/{etapa_id}", response_model=schemas.EtapaReceta)
def update_etapa(etapa_id: int, etapa: schemas.EtapaRecetaUpdate, db: Session = Depends(get_db)):
    return services.actualizar_etapa(db, etapa_id, etapa)

# Devuelve todas las etapas de la receta con el orden ya recalculado
@router.put("/{etapa_id}/orden", response_model=list[schemas.EtapaReceta])
def reorder_etapa(etapa_id: int, datos: schemas.EtapaRecetaOrden, db: Session = Depends(get_db)):
    return services.reordenar_etapas(db, etapa_id, datos.orden)

@router.delete("/{etapa_id}", response_model=schemas.EtapaReceta)
def delete_etapa(etapa_id: int, db: Session = Depends(get_db)):
    return services.eliminar_etapa(db, etapa_id)
