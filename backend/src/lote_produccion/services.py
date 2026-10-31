import logging
from typing import List, Literal
from datetime import date
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload, selectinload
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

def listar_lotes_historial(
    db: Session,
    orden: Literal["asc", "desc"] = "desc",
    producto_id: int | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
) -> schemas.LoteProduccionHistorial:

    consulta = (select(LoteProduccion).options(selectinload(LoteProduccion.producto)))

    filtros = []

    if producto_id is not None:
        filtros.append(LoteProduccion.producto_id == producto_id)
    if fecha_desde is not None:
        filtros.append(LoteProduccion.fecha_produccion >= fecha_desde)
    if fecha_hasta is not None:
        filtros.append(LoteProduccion.fecha_produccion <= fecha_hasta)

    consulta = consulta.where(*filtros)

    fecha = (LoteProduccion.fecha_produccion.asc() if orden == "asc" else LoteProduccion.fecha_produccion.desc())
    lotes = db.scalars(consulta.order_by(fecha, LoteProduccion.id.asc())).all()

    total_producido = None
    if producto_id is not None:
        total_producido = db.scalar(
                select(func.coalesce(func.sum(LoteProduccion.cantidad_producida), 0))
                .where(*filtros)
            )
    
    return schemas.LoteProduccionHistorial(lotes=lotes, total_producido=total_producido)

