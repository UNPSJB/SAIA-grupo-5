import logging
from datetime import date, datetime
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.lote_proveedor.models import LoteProveedor, HistorialEstadoLoteProveedor
from src.lote_proveedor import exceptions, schemas
from src.proveedor.models import Proveedor
from src.lote_proveedor.constants import EstadoLoteProveedor

logger = logging.getLogger(__name__)


def validar_unico(db: Session, proveedor_id: int, numero_lote: str, numero_remito: str, lote_id: int | None = None):
    lote = select(LoteProveedor).where(LoteProveedor.proveedor_id == proveedor_id,
                                        LoteProveedor.numero_lote == numero_lote)

    if lote_id:
        lote = lote.where(LoteProveedor.id != lote_id)
    if db.scalars(lote).first():
        raise exceptions.NumeroLoteDuplicado()

    remito = select(LoteProveedor).where(LoteProveedor.proveedor_id == proveedor_id,
                                        LoteProveedor.numero_remito == numero_remito)

    if lote_id:
        remito = remito.where(LoteProveedor.id != lote_id)
    if db.scalars(remito).first():
        raise exceptions.NumeroRemitoDuplicado()


def listar_lotes_proveedor(db: Session) -> List[schemas.LoteProveedor]:
    return db.scalars(select(LoteProveedor).order_by(LoteProveedor.fecha_recepcion.desc(), LoteProveedor.id.desc())).all()


def leer_lote_proveedor(db: Session, lote_proveedor_id: int) -> schemas.LoteProveedor:
    db_lote = db.scalars(select(LoteProveedor).where(LoteProveedor.id == lote_proveedor_id)).first()

    if db_lote is None:
        raise exceptions.LoteProveedorNoEncontrado()
    return db_lote


def crear_lote_proveedor(db: Session, lote: schemas.LoteProveedorCreate, usuario_id: int = 1) -> schemas.LoteProveedor:
    proveedor = db.scalars(select(Proveedor).where(Proveedor.id == lote.proveedor_id)).first()

    if not proveedor or not proveedor.activo:
        raise exceptions.ProveedorNoExisteOInactivo()

    if not proveedor.numero_habilitacion or not proveedor.vencimiento_habilitacion:
        raise exceptions.ProveedorSinHabilitacion()

    if proveedor.vencimiento_habilitacion and proveedor.vencimiento_habilitacion < date.today():
        raise exceptions.HabilitacionProveedorVencida()

    validar_unico(db, lote.proveedor_id, lote.numero_lote, lote.numero_remito)

    _lote_proveedor = LoteProveedor(
        proveedor_id=lote.proveedor_id,
        numero_lote=lote.numero_lote,
        numero_remito=lote.numero_remito,
        fecha_recepcion=lote.fecha_recepcion,
        archivo_adjunto=lote.archivo_adjunto,
        registrado_por_id=usuario_id,
        estado=EstadoLoteProveedor.LLEGADA,
    )
    db.add(_lote_proveedor)
    db.commit()            
    db.refresh(_lote_proveedor)

    primer_historial = HistorialEstadoLoteProveedor(
        lote_id=_lote_proveedor.id,
        estado="Llegada",
        usuario_id=usuario_id,
        observacion="Recepcion del lote de proveedor e ingreso al sistema.",
        fecha_hora=datetime.now(),
    )

    db.add(primer_historial)
    db.commit()
    return _lote_proveedor


def modificar_lote_proveedor(db: Session, lote_proveedor_id: int, lote_actualizado: schemas.LoteProveedorUpdate) -> schemas.LoteProveedor:
    db_lote = leer_lote_proveedor(db, lote_proveedor_id)

    for key, value in lote_actualizado.model_dump().items():
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
    db: Session, lote_proveedor_id: int, datos: schemas.AvanzarEtapaLote, usuario_id: int) -> schemas.LoteProveedor:
    db_lote = leer_lote_proveedor(db, lote_proveedor_id)

    if db_lote.estado == EstadoLoteProveedor.LLEGADA:
        db_lote.estado = EstadoLoteProveedor.DESEMPAQUE
        nuevo_estado_texto = "Desempaque"
    elif db_lote.estado == EstadoLoteProveedor.DESEMPAQUE:
        if not db_lote.insumos or len(db_lote.insumos) == 0:
            raise exceptions.LoteSinInsumosParaAcomodar()
        db_lote.estado = EstadoLoteProveedor.ACOMODADO
        nuevo_estado_texto = "Acomodado"
    else:
        raise exceptions.TransicionEstadoInvalida()

    nuevo_historial = HistorialEstadoLoteProveedor(
        lote_id=db_lote.id,
        estado=nuevo_estado_texto,
        usuario_id=usuario_id,
        observacion=datos.observacion.strip() if datos.observacion else None,
        fecha_hora=datetime.now(),
    )
    db.add(nuevo_historial)

    db.commit()
    db.refresh(db_lote)
    return db_lote


def listar_historial_lote(db: Session, lote_id: int) -> list[HistorialEstadoLoteProveedor]:
    return db.scalars(select(HistorialEstadoLoteProveedor).where(HistorialEstadoLoteProveedor.lote_id == lote_id)
                    .order_by(HistorialEstadoLoteProveedor.fecha_hora.asc())).all()