import logging
from typing import List
from sqlalchemy import select, update
from sqlalchemy.orm import Session, joinedload
from src.tipos_vencimientos.models import TipoVencimiento
from src.tipos_vencimientos import exceptions, schemas
from src.vencimiento_personal.models import VencimientoPersonal

logger = logging.getLogger(__name__)

def listar_tipos_vencimientos(db: Session) -> List[schemas.TipoVencimiento]:
    return db.scalars(select(TipoVencimiento)).all()

def leer_tipo_vencimiento(db: Session, tipo_vencimiento_id: int) -> schemas.TipoVencimiento:
    db_tipo_vencimiento = db.scalars(select(TipoVencimiento).where(TipoVencimiento.id == tipo_vencimiento_id)).first()

    if db_tipo_vencimiento is None:
        raise exceptions.TipoVencimientoNoEncontrado()
    return db_tipo_vencimiento

def crear_tipo_vencimiento(db: Session, tipo_vencimiento: schemas.TipoVencimientoCreate) -> schemas.TipoVencimiento:
    tipo_vencimiento_existente = db.scalars(select(TipoVencimiento).where(TipoVencimiento.nombre == tipo_vencimiento.nombre)).first()

    if tipo_vencimiento_existente:
        raise exceptions.TipoVencimientoDuplicado()

    _tipo_vencimiento = TipoVencimiento(**tipo_vencimiento.model_dump())
    db.add(_tipo_vencimiento)
    db.commit()
    db.refresh(_tipo_vencimiento)
    return _tipo_vencimiento

def modificar_tipo_vencimiento(db: Session, tipo_vencimiento_id: int, tipo_vencimiento: schemas.TipoVencimientoUpdate) -> schemas.TipoVencimiento:
    tipo_vencimiento_existente = db.scalars(select(TipoVencimiento).where(TipoVencimiento.nombre == tipo_vencimiento.nombre,
                                            TipoVencimiento.id != tipo_vencimiento_id)).first()
    if tipo_vencimiento_existente:
        raise exceptions.TipoVencimientoDuplicado()

    db_tipo_vencimiento = leer_tipo_vencimiento(db, tipo_vencimiento_id)

    for key, value in tipo_vencimiento.model_dump().items():
        setattr(db_tipo_vencimiento, key, value)

    db.commit()
    db.refresh(db_tipo_vencimiento)
    return db_tipo_vencimiento

def cambiar_estado_tipo_vencimiento(db: Session, tipo_vencimiento_id: int) -> schemas.TipoVencimiento:
    db_tipo_vencimiento = leer_tipo_vencimiento(db, tipo_vencimiento_id)

    if db_tipo_vencimiento.activo:
        vencimiento_personal_asociado = db.scalars(select(VencimientoPersonal).where(
            VencimientoPersonal.tipo_vencimiento_id == tipo_vencimiento_id,
            VencimientoPersonal.es_actual == True)).first()
        if vencimiento_personal_asociado:
            raise exceptions.TipoVencimientoEnUso()

    db_tipo_vencimiento.activo = not db_tipo_vencimiento.activo
    db.commit()
    db.refresh(db_tipo_vencimiento)
    return db_tipo_vencimiento