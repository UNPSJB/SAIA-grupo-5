import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.documentos.models import Documento
from src.documentos import schemas, exceptions

logger = logging.getLogger(__name__)

def crear_documento(db: Session, documento: schemas.DocumentoCreate) -> schemas.Documento:
    documento_existente = db.scalars(select(Documento).where(Documento.nombre == documento.nombre)).first()
    if documento_existente:
        raise exceptions.DocumentoDuplicado()

    _documento = Documento(**documento.model_dump())
    db.add(_documento)
    db.commit()
    db.refresh(_documento)
    return _documento

def listar_documentos(db: Session) -> List[schemas.Documento]:
    return db.scalars(select(Documento)).all()

def leer_documento(db: Session, documento_id: int) -> schemas.Documento:
    db_documento = db.scalar(select(Documento).where(Documento.id == documento_id))
    if db_documento is None:
        raise exceptions.DocumentoNoEncontrado()
    return db_documento

def modificar_documento(db: Session, documento_id: int, documento: schemas.DocumentoUpdate) -> schemas.Documento:
    db_documento = leer_documento(db, documento_id)
    db_documento.nombre = documento.nombre
    db_documento.descripcion = documento.descripcion
    db.commit()
    db.refresh(db_documento)
    return db_documento

def cambiar_estado_documento(db: Session, documento_id: int) -> schemas.Documento:
    db_documento = leer_documento(db, documento_id)
    if db_documento is None:
            raise exceptions.DocumentoNoEncontrado()
    
    db_documento.activo = not db_documento.activo
    db.commit()
    db.refresh(db_documento)
    return db_documento

