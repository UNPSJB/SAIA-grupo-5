import logging
from typing import List
from sqlalchemy import select, update
from sqlalchemy.orm import Session, joinedload
from src.insumo_quimico.models import InsumoQuimico
from src.insumo_quimico import exceptions, schemas
# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)


def crear_insumo_quimico(db: Session, insumo_quimico: schemas.InsumoQuimicoCreate) -> schemas.InsumoQuimico:
    insumo_quimico_existente = db.scalars(select(InsumoQuimico).where(InsumoQuimico.nombre == insumo_quimico.nombre, InsumoQuimico.unidad_medida == insumo_quimico.unidad_medida)).first()

    if insumo_quimico_existente:
        raise exceptions.InsumoQuimicoDuplicado()


    _insumo_quimico = InsumoQuimico(**insumo_quimico.model_dump())
    db.add(_insumo_quimico)
    db.commit()
    db.refresh(_insumo_quimico)
    return _insumo_quimico

def listar_insumos_quimicos(db: Session) -> List[schemas.InsumoQuimico]:
    return db.scalars(select(InsumoQuimico).options(joinedload(InsumoQuimico.tipo))).all()

def leer_insumo_quimico(db: Session, insumo_quimico_id: int) -> schemas.InsumoQuimico:
    db_insumo_quimico = db.scalar(select(InsumoQuimico).where(InsumoQuimico.id == insumo_quimico_id).options(joinedload(InsumoQuimico.tipo)))       # El joinedload es para traer toda la informacion del tipo de quimico
    if db_insumo_quimico is None:
        raise exceptions.InsumoQuimicoNoEncontrado()
    return db_insumo_quimico

def eliminar_insumo_quimico(db: Session, insumo_quimico_id: int) -> schemas.InsumoQuimicoDelete:
    db_insumo_quimico = leer_insumo_quimico(db, insumo_quimico_id)
    db_insumo_quimico.activo = False
    db.commit()
    db.refresh(db_insumo_quimico)
    return db_insumo_quimico

def modificar_insumo_quimico(db: Session, insumo_quimico_id: int, insumo_quimico: schemas.InsumoQuimicoUpdate) -> schemas.InsumoQuimico:  # Permite modificar el insumo pero si o si se tienen que enviar todos los campos
    db_insumo_quimico = leer_insumo_quimico(db, insumo_quimico_id)

    # Se modifico esto ya que generaba problemas al tratar de editar un insumo quimico
    insumo_quimico_actualizado = insumo_quimico.model_dump()
    for key, value in insumo_quimico_actualizado.items():
        setattr(db_insumo_quimico, key, value)

    db.commit()
    db.refresh(db_insumo_quimico)
    return db_insumo_quimico