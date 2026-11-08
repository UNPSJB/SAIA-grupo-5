import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.proveedor.models import Proveedor
from src.proveedor import exceptions, schemas

logger = logging.getLogger(__name__)


def listar_proveedores(db: Session) -> List[schemas.Proveedor]:
    return db.scalars(select(Proveedor)).all()


def leer_proveedor(db: Session, proveedor_id: int) -> schemas.Proveedor:
    db_proveedor = db.scalars(select(Proveedor).where(Proveedor.id == proveedor_id)).first()

    if db_proveedor is None:
        raise exceptions.ProveedorNoEncontrado()
    return db_proveedor


def crear_proveedor(db: Session, proveedor: schemas.ProveedorCreate) -> schemas.Proveedor:
    proveedor_existente = db.scalars(select(Proveedor).where(Proveedor.cuit == proveedor.cuit)).first()

    if proveedor_existente:
        raise exceptions.ProveedorCuitDuplicado()

    _proveedor = Proveedor(**proveedor.model_dump())
    db.add(_proveedor)
    db.commit()
    db.refresh(_proveedor)
    return _proveedor


def modificar_proveedor(db: Session, proveedor_id: int, proveedor: schemas.ProveedorUpdate) -> schemas.Proveedor:
    proveedor_existente = db.scalars(select(Proveedor).where(Proveedor.cuit == proveedor.cuit, Proveedor.id != proveedor_id)).first()
    
    if proveedor_existente:
        raise exceptions.ProveedorCuitDuplicado()

    db_proveedor = leer_proveedor(db, proveedor_id)

    for key, value in proveedor.model_dump().items():
        setattr(db_proveedor, key, value)

    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor


def cambiar_estado_proveedor(db: Session, proveedor_id: int) -> schemas.Proveedor:
    db_proveedor = leer_proveedor(db, proveedor_id)

    db_proveedor.activo = not db_proveedor.activo
    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor


def renovar_habilitacion_proveedor(db: Session, proveedor_id: int, datos: schemas.ProveedorRenovarHabilitacion) -> schemas.Proveedor:
    db_proveedor = leer_proveedor(db, proveedor_id)

    if db_proveedor.vencimiento_habilitacion and datos.vencimiento_habilitacion <= db_proveedor.vencimiento_habilitacion:
        raise exceptions.HabilitacionFechaInvalida()

    db_proveedor.numero_habilitacion = datos.numero_habilitacion
    db_proveedor.vencimiento_habilitacion = datos.vencimiento_habilitacion
    db_proveedor.observacion_habilitacion = datos.observacion_habilitacion
    if datos.archivo_adjunto is not None:
        db_proveedor.archivo_adjunto = datos.archivo_adjunto

    db.commit()
    db.refresh(db_proveedor)
    return db_proveedor