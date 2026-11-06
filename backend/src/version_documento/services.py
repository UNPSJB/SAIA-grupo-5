import logging
from typing import List
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.version_documento.models import VersionDocumento
from src.historial_vigencia_documento.models import HistorialVigencia
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

# Todas las versiones
def listar_versiones(db: Session) -> List[schemas.VersionDocumento]:
    return db.scalars(select(VersionDocumento)).all()

# Versiones de UN documento 
def listar_versiones_documento(
    db: Session, documento_id: int, incluir_historicas: bool = False
) -> List[schemas.VersionDocumento]:
    consulta = select(VersionDocumento).where(VersionDocumento.documento_id == documento_id)
    if not incluir_historicas:
        consulta = consulta.where(VersionDocumento.fecha_hasta_vigencia.is_(None))
    return db.scalars(consulta.order_by(VersionDocumento.version.desc())).all()

def leer_version_documento(db: Session, version_id: int) -> schemas.VersionDocumento:
    db_version = db.scalar(select(VersionDocumento).where(VersionDocumento.id == version_id))
    if db_version is None:
        raise exceptions.VersionNoEncontrada()
    return db_version

def modificar_version_documento(db: Session, version_id: int, version: schemas.VersionDocumentoUpdate) -> schemas.VersionDocumento:
    db_version = leer_version_documento(db, version_id)
    if version.archivo is not None:
        db_version.archivo = version.archivo
    db_version.observacion = version.observacion
    db.commit()
    db.refresh(db_version)
    return db_version

def cambiar_estado_version_documento(db: Session, version_id: int) -> schemas.VersionDocumento:
    db_version = leer_version_documento(db, version_id)
    if db_version.vigente and db_version.activo:
        raise exceptions.VersionVigente()
    db_version.activo = not db_version.activo
    db.commit()
    db.refresh(db_version)
    return db_version


def marcar_version_vigente(
    db: Session, 
    documento_id: int, 
    version_id: int, 
    current_persona_id: int
) -> schemas.VersionDocumento:
    
    ahora = datetime.now()

    version_nueva = db.scalar(
        select(VersionDocumento).where(
            VersionDocumento.id == version_id,
            VersionDocumento.documento_id == documento_id
        )
    )
    if version_nueva is None:
        raise exceptions.VersionNoEncontrada()

    if not version_nueva.activo:
        raise exceptions.VersionInactiva()    

    if version_nueva.vigente:
        return version_nueva

    try:
        version_anterior = db.scalar(
            select(VersionDocumento).where(
                VersionDocumento.documento_id == documento_id,
                VersionDocumento.vigente.is_(True),
            )
        )
 
        version_anterior_id = None
        if version_anterior is not None:
            version_anterior.vigente = False
            version_anterior.fecha_hasta_vigencia = ahora
            version_anterior_id = version_anterior.id
            db.flush()
 
        version_nueva.vigente = True
        version_nueva.fecha_desde_vigencia = ahora
        version_nueva.fecha_hasta_vigencia = None  
        version_nueva.fecha_aprobacion = ahora
        version_nueva.aprobador_id = current_persona_id
 
        db.add(HistorialVigencia(
            documento_id=documento_id,
            version_anterior_id=version_anterior_id,
            version_nueva_id=version_nueva.id,
            persona_id=current_persona_id,
            fecha_hora=ahora,
        ))
 
        db.commit()

    except IntegrityError:
        db.rollback()
        raise exceptions.VersionIntegridad()

    db.refresh(version_nueva)
    return version_nueva
 

