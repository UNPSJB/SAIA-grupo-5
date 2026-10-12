import logging
from datetime import date
from fastapi import Depends, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.tipo_incidente import schemas, services
from src.auth.router_base import PermissionedRouter

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/tipos-incidentes", tags=["tipos-incidentes"])

@router.post("/", response_model=schemas.TipoIncidente)
def create_tipo_incidente(tipo_incidente: schemas.TipoIncidenteCreate, db: Session = Depends(get_db)):
    return services.crear_tipo_incidente(db, tipo_incidente)

@router.get("/", response_model=list[schemas.TipoIncidente])
def read_tipos_incidentes(db: Session = Depends(get_db)):
    return services.listar_tipos_incidentes(db)

@router.get("/{tipo_incidente_id}", response_model=schemas.TipoIncidente)
def read_tipo_incidente(tipo_incidente_id: int, db: Session = Depends(get_db)):
    return services.leer_tipo_incidente(db, tipo_incidente_id)

@router.put("/{tipo_incidente_id}", response_model=schemas.TipoIncidente)
def update_tipo_incidente(tipo_incidente_id: int, tipo_incidente: schemas.TipoIncidenteUpdate, db: Session = Depends(get_db)):
    return services.modificar_tipo_incidente(db, tipo_incidente_id, tipo_incidente)

@router.patch("/{tipo_incidente_id}/estado", response_model=schemas.TipoIncidente)
def cambiar_estado_tipo_incidente(tipo_incidente_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_tipo_incidente(db, tipo_incidente_id)

