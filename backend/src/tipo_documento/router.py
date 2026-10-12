import logging
from datetime import date
from fastapi import Depends, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.tipo_documento import schemas, services
from src.auth.router_base import PermissionedRouter

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/tipos-documentos", tags=["tipos-documentos"])

@router.post("/", response_model=schemas.TipoDocumento)
def create_tipo_documento(tipo_documento: schemas.TipoDocumentoCreate, db: Session = Depends(get_db)):
    return services.crear_tipo_documento(db, tipo_documento)

@router.get("/", response_model=list[schemas.TipoDocumento])
def read_tipos_documentos(db: Session = Depends(get_db)):
    return services.listar_tipos_documentos(db)

@router.get("/{tipo_documento_id}", response_model=schemas.TipoDocumento)
def read_tipo_documento(tipo_documento_id: int, db: Session = Depends(get_db)):
    return services.leer_tipo_documento(db, tipo_documento_id)

@router.put("/{tipo_documento_id}", response_model=schemas.TipoDocumento)
def update_tipo_documento(tipo_documento_id: int, tipo_documento: schemas.TipoDocumentoUpdate, db: Session = Depends(get_db)):
    return services.modificar_tipo_documento(db, tipo_documento_id, tipo_documento)

@router.patch("/{tipo_documento_id}/estado", response_model=schemas.TipoDocumento)
def cambiar_estado_tipo_documento(tipo_documento_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_tipo_documento(db, tipo_documento_id)

