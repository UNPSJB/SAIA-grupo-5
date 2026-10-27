import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from src.lote_produccion.models import LoteProduccion
from src.lote_produccion import schemas, exceptions
from src.producto.models import Producto
from src.producto import services as producto_services
from datetime import date
from sqlalchemy import func

logger = logging.getLogger(__name__)


def obtener_estadisticas_produccion(
    db: Session,
    fecha_desde: date,
    fecha_hasta: date,
    producto_id: int | None = None
) -> List[schemas.EstadisticaProduccion]:

    query = (
        select(
            LoteProduccion.producto_id,
            Producto.nombre.label("producto_nombre"),
            LoteProduccion.fecha_produccion.label("fecha"),
            func.sum(LoteProduccion.cantidad_producida).label("cantidad")
        )
        .join(Producto, LoteProduccion.producto_id == Producto.id)
        .where(
            LoteProduccion.fecha_produccion >= fecha_desde,
            LoteProduccion.fecha_produccion <= fecha_hasta,
            LoteProduccion.activo == True
        )
    )

    if producto_id is not None:
        query = query.where(LoteProduccion.producto_id == producto_id)

    query = query.group_by(
        LoteProduccion.producto_id,
        Producto.nombre,
        LoteProduccion.fecha_produccion
    ).order_by(
        LoteProduccion.fecha_produccion.asc(),
        Producto.nombre.asc()
    )

    resultados = db.execute(query).all()

    return [
        schemas.EstadisticaProduccion(
            producto_id=registro.producto_id,
            producto_nombre=registro.producto_nombre,
            fecha=registro.fecha,
            cantidad=registro.cantidad
        )
        for registro in resultados
    ]