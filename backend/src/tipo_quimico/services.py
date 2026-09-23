import logging
from typing import List
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session
from src.tipo_quimico.models import TipoQuimico
from src.tipo_quimico import schemas, exceptions

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

# operaciones CRUD para Insumos

def crear_tipo_quimico(db: Session, tipo_quimico: schemas.TipoQuimicoCreate) -> schemas.TipoQuimico:
    tipo_quimico_existente = db.scalars(select(TipoQuimico).where(TipoQuimico.nombre == tipo_quimico.nombre)).first()

    if tipo_quimico_existente:
        raise exceptions.TipoQuimicoDuplicado()


    _tipo_quimico = TipoQuimico(**tipo_quimico.model_dump())
    db.add(_tipo_quimico)
    db.commit()
    db.refresh(_tipo_quimico)
    return _tipo_quimico

def listar_tipo_quimico(db: Session) -> List[schemas.TipoQuimico]:
    return db.scalars(select(TipoQuimico)).all()

def leer_tipo_quimico(db: Session, tipo_quimico_id: int) -> schemas.TipoQuimico:
    db_tipo_quimico = db.scalar(select(TipoQuimico).where(TipoQuimico.id == tipo_quimico_id))
    if db_tipo_quimico is None:
        raise exceptions.TipoQuimicoNoEncontrado()
    return db_tipo_quimico


def modificar_tipo_quimico(db: Session, tipo_quimico_id: int, tipo_quimico: schemas.TipoQuimicoUpdate) -> schemas.TipoQuimico:  # Permite modificar el insumo pero si o si se tienen que enviar todos los campos
    db_tipo_quimico = leer_tipo_quimico(db, tipo_quimico_id)

    tipo_quimico_actualizado = tipo_quimico.model_dump(exclude_unset=True)
    for key, value in tipo_quimico_actualizado.items():
        setattr(db_tipo_quimico, key, value)
    
    db.commit()
    db.refresh(db_tipo_quimico)
    return db_tipo_quimico

def cambiar_estado_tipo_quimico(db: Session, tipo_quimico_id: int) -> schemas.TipoQuimico:
    db_tipo_quimico = leer_tipo_quimico(db, tipo_quimico_id)
    if db_tipo_quimico is None:
        raise exceptions.TipoQuimicoNoEncontrado()
    
    db_tipo_quimico.activo = not db_tipo_quimico.activo
    db.commit()
    db.refresh(db_tipo_quimico)
    return db_tipo_quimico