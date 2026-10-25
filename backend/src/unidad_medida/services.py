import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.unidad_medida.models import UnidadMedida
from src.unidad_medida import schemas, exceptions
from src.insumos.models import Insumo
from src.consumo_producto.models import ConsumoProducto
from src.producto.models import Producto

logger = logging.getLogger(__name__)

def crear_unidad_medida(db: Session, unidad_medida: schemas.UnidadMedidaCreate) -> schemas.UnidadMedida:
    unidad_existente = db.scalars(select(UnidadMedida).where(UnidadMedida.nombre == unidad_medida.nombre)).first()

    if unidad_existente:
        raise exceptions.UnidadMedidaDuplicada()

    _unidad_medida = UnidadMedida(**unidad_medida.model_dump())
    db.add(_unidad_medida)
    db.commit()
    db.refresh(_unidad_medida)
    return _unidad_medida

def listar_unidad_medida(db: Session) -> List[schemas.UnidadMedida]:
    return db.scalars(select(UnidadMedida)).all()

def leer_unidad_medida(db: Session, unidad_medida_id: int) -> schemas.UnidadMedida:
    db_unidad_medida = db.scalar(select(UnidadMedida).where(UnidadMedida.id == unidad_medida_id))
    if db_unidad_medida is None:
        raise exceptions.UnidadMedidaNoEncontrada()
    return db_unidad_medida

def modificar_unidad_medida(db: Session, unidad_medida_id: int, unidad_medida: schemas.UnidadMedidaUpdate) -> schemas.UnidadMedida:
    db_unidad_medida = leer_unidad_medida(db, unidad_medida_id)

    if not db_unidad_medida.activo:
        raise exceptions.UnidadMedidaDadaDeBaja()

    unidad_existente = db.scalars(select(UnidadMedida).where(UnidadMedida.nombre == unidad_medida.nombre,
                        UnidadMedida.id != unidad_medida_id)).first()

    if unidad_existente:
        raise exceptions.UnidadMedidaDuplicada()

    unidad_actualizada = unidad_medida.model_dump(exclude_unset=True)
    for key, value in unidad_actualizada.items():
        setattr(db_unidad_medida, key, value)
    
    db.commit()
    db.refresh(db_unidad_medida)
    return db_unidad_medida

def cambiar_estado_unidad_medida(db: Session, unidad_medida_id: int) -> schemas.UnidadMedida:
    db_unidad_medida = leer_unidad_medida(db, unidad_medida_id)
    if db_unidad_medida is None:
        raise exceptions.UnidadMedidaNoEncontrada()

    if db_unidad_medida.activo:
        insumo_asociado = db.scalars(select(Insumo).where(Insumo.unidad_medida_id == unidad_medida_id, Insumo.activo == True)).first()
        consumo_asociado = db.scalars(select(ConsumoProducto).where(ConsumoProducto.unidad_medida_id == unidad_medida_id, ConsumoProducto.estado == True)).first()
        producto_asociado = db.scalars(select(Producto).where(Producto.unidad_medida_id == unidad_medida_id, Producto.activo == True)).first()

        if insumo_asociado or consumo_asociado or producto_asociado:
            raise exceptions.UnidadMedidaUtilizada()
    
    db_unidad_medida.activo = not db_unidad_medida.activo
    db.commit()
    db.refresh(db_unidad_medida)
    return db_unidad_medida