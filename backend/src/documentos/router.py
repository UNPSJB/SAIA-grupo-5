import logging
from datetime import date
from fastapi import Depends, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.documentos import schemas, services
from src.auth.router_base import PermissionedRouter

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/documentos", tags=["documentos"])

@router.post("/", response_model=schemas.Documento)
def create_documento(documento: schemas.DocumentoCreate, db: Session = Depends(get_db)):
    return services.crear_documento(db, documento)

@router.get("/", response_model=list[schemas.Documento])
def read_documentos(db: Session = Depends(get_db)):
    return services.listar_documentos(db)

@router.get("/{documento_id}", response_model=schemas.Documento)
def read_documento(documento_id: int, db: Session = Depends(get_db)):
    return services.leer_documento(db, documento_id)

@router.put("/{documento_id}", response_model=schemas.Documento)
def update_documento(documento_id: int, documento: schemas.DocumentoUpdate, db: Session = Depends(get_db)):
    return services.modificar_documento(db, documento_id, documento)

@router.patch("/{documento_id}/estado", response_model=schemas.Documento)
def cambiar_estado_documento(documento_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_documento(db, documento_id)



#revisar modificar documento
#revisar duplicado de doc, tipo y version
