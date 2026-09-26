import logging
from typing import List
from sqlalchemy import select, update, func
from sqlalchemy.orm import Session
from src.consumo_producto.models import ConsumoProducto
from src.consumo_producto import schemas, exceptions
from datetime import date
from src.tareas_ocurrencia.models import TareaOcurrencia
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia

logger = logging.getLogger(__name__)

def crear_consumo_producto(db: Session, consumo: schemas.ConsumoProductoCreate) -> schemas.ConsumoProducto:
    consumo_existente = db.scalars(select(ConsumoProducto).where(ConsumoProducto.tarea_id == consumo.tarea_id, ConsumoProducto.insumo_quimico_id == consumo.insumo_quimico_id)).first()

    if consumo_existente:
        raise exceptions.ConsumoDuplicado()

    _consumo = ConsumoProducto(**consumo.model_dump())
    db.add(_consumo)
    db.commit()
    db.refresh(_consumo)
    return _consumo

def leer_consumo_producto(db: Session, consumo_id: int) -> schemas.ConsumoProducto:
    db_consumo = db.scalar(select(ConsumoProducto).where(ConsumoProducto.id == consumo_id))
    if db_consumo is None:
        raise exceptions.ConsumoNoEncontrado()
    return db_consumo

def modificar_consumo_producto(
        db: Session, consumo_id: int, consumo: schemas.ConsumoProductoUpdate) -> schemas.ConsumoProducto:
    db_consumo = leer_consumo_producto(db, consumo_id)
    db.execute(
        update(ConsumoProducto)
        .where(ConsumoProducto.id == consumo_id)
        .values(**consumo.model_dump(exclude_unset=True))
    )
    db.commit()
    db.refresh(db_consumo)
    logger.info(
        f"Se actualizo correctamente el consumo: "
        f"{db_consumo.id}"
    )
    return db_consumo

def cambiar_estado_consumo_producto(db: Session, consumo_id: int) -> schemas.ConsumoProductoDelete:
    db_consumo = leer_consumo_producto(db, consumo_id)
    if db_consumo is None:
        raise exceptions.ConsumoNoEncontrado()
    
    db_consumo.estado = not db_consumo.estado
    db.commit()
    db.refresh(db_consumo)
    return db_consumo

# CONSUMO ACUMULADO 
def listar_consumos_productos(db:Session) -> List[schemas.ConsumoProducto]:
    return db.scalars(select(ConsumoProducto)).all()

def listar_consumos_por_producto(db:Session, insumo_id) -> List[schemas.ConsumoProducto]:
    db_consumos = db.scalars(select(ConsumoProducto).where(ConsumoProducto.insumo_quimico_id == insumo_id)).all()
    return db_consumos

def listar_consumos_por_tarea(db:Session, tarea_id) -> List[schemas.ConsumoProducto]:
    db_consumos = db.scalars(select(ConsumoProducto).where(ConsumoProducto.tarea_id == tarea_id)).all()
    return db_consumos

def consultar_consumo_acumulado(db:Session, insumo_id, fecha_desde: date | None = None, fecha_hasta: date | None = None,) -> float:
    condiciones = [ConsumoProducto.insumo_quimico_id == insumo_id, TareaOcurrencia.estado == EstadoTareaOcurrencia.COMPLETADA,]

    if fecha_desde is not None:
        condiciones.append(TareaOcurrencia.fecha >= fecha_desde)
    
    if fecha_hasta is not None:
        condiciones.append(TareaOcurrencia.fecha <= fecha_hasta)

    db_consumo_acumulado = db.scalar(select(func.sum(ConsumoProducto.cantidad_aproximada))
            .join(TareaOcurrencia, TareaOcurrencia.tarea_id_origen == ConsumoProducto.tarea_id)
            .where(*condiciones)
    )
    
    return db_consumo_acumulado or 0.0

