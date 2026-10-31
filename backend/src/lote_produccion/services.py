import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from src.lote_produccion.models import LoteProduccion
from src.lote_produccion import schemas, exceptions
from src.producto.models import Producto
from src.producto import services as producto_services

logger = logging.getLogger(__name__)


def crear_lote_produccion(db: Session, lote: schemas.LoteProduccionCreate) -> schemas.LoteProduccion:
    db_producto = producto_services.leer_producto(db, lote.producto_id)
    if not db_producto.activo:
        raise exceptions.ProductoDadoDeBaja()

    _lote = LoteProduccion(**lote.model_dump())
    db.add(_lote)
    db.commit()
    db.refresh(_lote)
    return leer_lote_produccion(db, _lote.id)


def listar_lotes_produccion(db: Session) -> List[schemas.LoteProduccion]:
    return db.scalars(select(LoteProduccion).options(joinedload(LoteProduccion.producto).
                                                joinedload(Producto.unidad_medida))).all()


def leer_lote_produccion(db: Session, lote_id: int) -> schemas.LoteProduccion:
    db_lote = db.scalar(select(LoteProduccion).where(LoteProduccion.id == lote_id)
                        .options(joinedload(LoteProduccion.producto).joinedload(Producto.unidad_medida)))
    if db_lote is None:
        raise exceptions.LoteProduccionNoEncontrado()
    return db_lote

def listar_lotes_por_producto(db: Session, producto_id: int) -> List[schemas.LoteProduccion]:
    return db.scalars(select(LoteProduccion).where(LoteProduccion.producto_id == producto_id)
                    .options(joinedload(LoteProduccion.producto).joinedload(Producto.unidad_medida))).all()


def cambiar_estado_lote_produccion(db: Session, lote_id: int) -> schemas.LoteProduccion:
    db_lote = leer_lote_produccion(db, lote_id)

    if not db_lote.activo and not db_lote.producto.activo:
        raise exceptions.ProductoDadoDeBaja()

    db_lote.activo = not db_lote.activo
    db.commit()
    db.refresh(db_lote)
    return db_lote


def modificar_lote_produccion(db: Session, lote_id: int, lote: schemas.LoteProduccionUpdate) -> schemas.LoteProduccion:
    db_lote = leer_lote_produccion(db, lote_id)
    if not db_lote.activo:
        raise exceptions.LoteProduccionDadoDeBaja()

    db_producto = producto_services.leer_producto(db, lote.producto_id)
    if not db_producto.activo:
        raise exceptions.ProductoDadoDeBaja()

    lote_actualizado = lote.model_dump()
    for key, value in lote_actualizado.items():
        setattr(db_lote, key, value)

    db.commit()
    db.refresh(db_lote)
    return leer_lote_produccion(db, db_lote.id)