import logging
from datetime import datetime
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.version_documento.models import VersionDocumento
from src.version_documento import schemas, exceptions

logger = logging.getLogger(__name__)

def crear_version_documento(db: Session, version: schemas.VersionDocumentoCreate) -> schemas.VersionDocumento:
    ultima_version = db.scalar(select(VersionDocumento.version)
                                   .where(VersionDocumento.documento_id == version.documento_id)
                                   .order_by(VersionDocumento.version.desc())
                                   .limit(1)
    )

    nueva_version = (ultima_version or 0) + 1

    datos = version.model_dump()
    datos["version"] = nueva_version
    datos["fecha_subida"] = datetime.now()
    
    _version = VersionDocumento(**datos)
    db.add(_version)
    db.commit()
    db.refresh(_version)
    return _version

#todas las versiones
def listar_versiones(db: Session) -> List[schemas.VersionDocumento]:
    return db.scalars(select(VersionDocumento)).all()

#versiones de UN documento 
def listar_versiones_documento(db: Session, documento_id: int) -> List[schemas.VersionDocumento]:
    db_versiones = db.scalars(select(VersionDocumento).where(VersionDocumento.documento_id == documento_id)).all()
    return db_versiones

def leer_version_documento(db: Session, version_id: int) -> schemas.VersionDocumento:
    db_version = db.scalar(select(VersionDocumento).where(VersionDocumento.id == version_id))
    if db_version is None:
        raise exceptions.VersionNoEncontrada()
    return db_version

def modificar_version_documento(db: Session, version_id: int, version: schemas.VersionDocumentoUpdate) -> schemas.VersionDocumento:
    db_version = leer_version_documento(db, version_id)
    if db_version is None:
            raise exceptions.VersionNoEncontrada()
    
    db_version.observacion = version.observacion
    db.commit()
    db.refresh(db_version)
    return db_version

def cambiar_estado_version_documento(db: Session, version_id: int) -> schemas.VersionDocumento:
    db_version = leer_version_documento(db, version_id)
    if db_version is None:
        raise exceptions.VersionNoEncontrada()

    if db_version.vigente and db_version.activo:
        raise exceptions.VersionVigente()

    db_version.activo = not db_version.activo
    db.commit()
    db.refresh(db_version)
    return db_version

