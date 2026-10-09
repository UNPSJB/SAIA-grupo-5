import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from src.tipo_incidente.models import TipoIncidente
from src.tipo_incidente import schemas, exceptions

logger = logging.getLogger(__name__)

def crear_tipo_incidente(db: Session, tipo_incidente: schemas.TipoIncidenteCreate) -> schemas.TipoIncidente:
    tipo_incidente_existente = db.scalars(select(TipoIncidente).where(TipoIncidente.nombre == tipo_incidente.nombre)).first()
    if tipo_incidente_existente:
        raise exceptions.TipoIncidenteDuplicado()
    
    _tipo_incidente = TipoIncidente(**tipo_incidente.model_dump())
    db.add(_tipo_incidente)
    db.commit()
    db.refresh(_tipo_incidente)
    return _tipo_incidente

def listar_tipos_incidentes(db: Session) -> List[schemas.TipoIncidente]:
    return db.scalars(select(TipoIncidente)).all()

def leer_tipo_incidente(db: Session, tipo_incidente_id: int) -> schemas.TipoIncidente:
    db_tipo_incidente = db.scalar(select(TipoIncidente).where(TipoIncidente.id == tipo_incidente_id))
    if db_tipo_incidente is None:
        raise exceptions.TipoIncidenteNoEncontrado()
    return db_tipo_incidente

def modificar_tipo_incidente(db: Session, tipo_incidente_id: int, tipo_incidente: schemas.TipoIncidenteUpdate) -> schemas.TipoIncidente:
    db_tipo_incidente = leer_tipo_incidente(db, tipo_incidente_id)
    db_tipo_incidente.nombre = tipo_incidente.nombre
    db_tipo_incidente.descripcion = tipo_incidente.descripcion
    db.commit()
    db.refresh(db_tipo_incidente)
    return db_tipo_incidente

def cambiar_estado_tipo_incidente(db: Session, tipo_incidente_id: int) -> schemas.TipoIncidente:
    db_tipo_incidente = leer_tipo_incidente(db, tipo_incidente_id)
    if db_tipo_incidente is None:
        raise exceptions.TipoIncidenteNoEncontrado()

    db_tipo_incidente.activo = not db_tipo_incidente.activo
    db.commit()
    db.refresh(db_tipo_incidente)
    return db_tipo_incidente
