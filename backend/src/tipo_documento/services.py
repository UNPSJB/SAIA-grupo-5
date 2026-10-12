import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.tipo_documento.models import TipoDocumento
from src.tipo_documento import schemas, exceptions
from src.documentos.models import Documento

logger = logging.getLogger(__name__)

def crear_tipo_documento(db: Session, tipo_documento: schemas.TipoDocumentoCreate) -> schemas.TipoDocumento:
    tipo_documento_existente = db.scalars(select(TipoDocumento).where(TipoDocumento.nombre == tipo_documento.nombre)).first()
    if tipo_documento_existente:
        raise exceptions.TipoDocumentoDuplicado()
    
    _tipo_documento = TipoDocumento(**tipo_documento.model_dump())
    db.add(_tipo_documento)
    db.commit()
    db.refresh(_tipo_documento)
    return _tipo_documento

def listar_tipos_documentos(db: Session) -> List[schemas.TipoDocumento]:
    return db.scalars(select(TipoDocumento)).all()

def leer_tipo_documento(db: Session, tipo_documento_id: int) -> schemas.TipoDocumento:
    db_tipo_documento = db.scalar(select(TipoDocumento).where(TipoDocumento.id == tipo_documento_id))
    if db_tipo_documento is None:
        raise exceptions.TipoDocumentoNoEncontrado()
    return db_tipo_documento

def modificar_tipo_documento(db: Session, tipo_documento_id: int, tipo_documento: schemas.TipoDocumentoUpdate) -> schemas.TipoDocumento:
    db_tipo_documento = leer_tipo_documento(db, tipo_documento_id)
    db_tipo_documento.nombre = tipo_documento.nombre
    db_tipo_documento.descripcion = tipo_documento.descripcion
    db.commit()
    db.refresh(db_tipo_documento)
    return db_tipo_documento

def cambiar_estado_tipo_documento(db: Session, tipo_documento_id: int) -> schemas.TipoDocumento:
    db_tipo_documento = leer_tipo_documento(db, tipo_documento_id)

    if db_tipo_documento.activo:
        documento_asociado = db.scalars(select(Documento).where(
            Documento.tipo_id == tipo_documento_id,
            Documento.activo == True)).first()
        if documento_asociado:
            raise exceptions.TipoDocumentoEnUso()

    db_tipo_documento.activo = not db_tipo_documento.activo
    db.commit()
    db.refresh(db_tipo_documento)
    return db_tipo_documento
