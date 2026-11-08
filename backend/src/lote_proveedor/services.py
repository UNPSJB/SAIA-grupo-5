import logging
from datetime import date
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.lote_proveedor.models import LoteProveedor
from src.lote_proveedor import exceptions, schemas
from src.proveedor.models import Proveedor
from src.lote_proveedor.constants import EstadoLoteProveedor

logger = logging.getLogger(__name__)


def listar_lotes_proveedor(db: Session) -> List[schemas.LoteProveedor]:
    return db.scalars(select(LoteProveedor).order_by(LoteProveedor.fecha_recepcion.desc(), LoteProveedor.id.desc())).all()


def leer_lote_proveedor(db: Session, lote_proveedor_id: int) -> schemas.LoteProveedor:
    db_lote = db.scalars(select(LoteProveedor).where(LoteProveedor.id == lote_proveedor_id)).first()

    if db_lote is None:
        raise exceptions.LoteProveedorNoEncontrado()
    return db_lote


def crear_lote_proveedor(db: Session, lote_data: schemas.LoteProveedorCreate, usuario_id: int = 1) -> schemas.LoteProveedor:
    proveedor = db.scalars(select(Proveedor).where(Proveedor.id == lote_data.proveedor_id)).first()

    if not proveedor or not proveedor.activo:
        raise exceptions.ProveedorNoExisteOInactivo()

    if proveedor.vencimiento_habilitacion and proveedor.vencimiento_habilitacion < date.today():
        raise exceptions.HabilitacionProveedorVencida()

    _lote_proveedor = LoteProveedor(
        proveedor_id=lote_data.proveedor_id,
        numero_lote=lote_data.numero_lote,
        numero_remito=lote_data.numero_remito,
        fecha_recepcion=lote_data.fecha_recepcion,
        registrado_por_id=usuario_id,
    )

    db.add(_lote_proveedor)
    db.commit()
    db.refresh(_lote_proveedor)
    return _lote_proveedor


def modificar_lote_proveedor(db: Session, lote_proveedor_id: int, lote_update: schemas.LoteProveedorUpdate) -> schemas.LoteProveedor:
    db_lote = leer_lote_proveedor(db, lote_proveedor_id)

    for key, value in lote_update.model_dump().items():
        setattr(db_lote, key, value)

    db.commit()
    db.refresh(db_lote)
    return db_lote


def cambiar_estado_lote_proveedor(db: Session, lote_proveedor_id: int) -> schemas.LoteProveedor:
    db_lote = leer_lote_proveedor(db, lote_proveedor_id)

    db_lote.activo = not db_lote.activo
    db.commit()
    db.refresh(db_lote)
    return db_lote


def avanzar_etapa_lote_proveedor(
    db: Session, lote_proveedor_id: int, datos: schemas.AvanzarEtapaLote) -> schemas.LoteProveedor:
    db_lote = leer_lote_proveedor(db, lote_proveedor_id)

    if db_lote.estado == EstadoLoteProveedor.LLEGADA:
        db_lote.estado = EstadoLoteProveedor.DESEMPAQUE
    elif db_lote.estado == EstadoLoteProveedor.DESEMPAQUE:
        db_lote.estado = EstadoLoteProveedor.ACOMODADO
    else:
        raise exceptions.TransicionEstadoInvalida()

    if datos.observaciones is not None:
        db_lote.observaciones = datos.observaciones

    db.commit()
    db.refresh(db_lote)
    return db_lote