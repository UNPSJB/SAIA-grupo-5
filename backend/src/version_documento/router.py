import logging
from datetime import date
from fastapi import Depends, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.version_documento import schemas, services
from src.auth.router_base import PermissionedRouter
from src.auth.dependencies import get_current_persona
from src.personal.models import Persona

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/versiones-documentos", tags=["versiones-documentos"])

@router.post("/", response_model=schemas.VersionDocumento)
def create_version_documento(version: schemas.VersionDocumentoCreate, db: Session = Depends(get_db)):
    return services.crear_version_documento(db, version)

#listado todas las versiones
@router.get("/", response_model=list[schemas.VersionDocumento])
def read_versiones(db: Session = Depends(get_db)):
    return services.listar_versiones(db)

#listado versiones de UN documento
@router.get("/documento/{documento_id}", response_model=list[schemas.VersionDocumento])
def read_versiones_documento(documento_id:int, db: Session = Depends(get_db)):
    return services.listar_versiones_documento(db, documento_id)

@router.get("/{version_id}", response_model=schemas.VersionDocumento)
def read_version_documento(version_id: int, db: Session = Depends(get_db)):
    return services.leer_version_documento(db, version_id)

@router.put("/{version_id}", response_model=schemas.VersionDocumento)
def update_version_documento(version_id: int, version: schemas.VersionDocumentoUpdate, db: Session = Depends(get_db)):
    return services.modificar_version_documento(db, version_id, version)

@router.patch("/{version_id}/estado", response_model=schemas.VersionDocumento)
def cambiar_estado_version_documento(version_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_version_documento(db, version_id)

@router.post("/documento/{documento_id}/version/{version_id}/vigencia", response_model=schemas.VersionDocumento)
def marcar_version_vigente(
    documento_id: int,
    version_id: int,
    db: Session = Depends(get_db),
    current_persona: Persona = Depends(get_current_persona)
):
    return services.marcar_version_vigente(db, documento_id, version_id, current_persona.id)

