import logging
from typing import List, Literal
from datetime import date
from sqlalchemy import select, func, delete
from sqlalchemy.orm import Session, joinedload, selectinload
from src.lote_produccion.models import LoteProduccion, EstadoLote, InsumoUtilizado
from src.lote_produccion import schemas, exceptions
from src.producto.models import Producto
from src.producto import services as producto_services
from src.insumos.models import Insumo

logger = logging.getLogger(__name__)

SIGUIENTE_ESTADO ={
    EstadoLote.EN_PRODUCCION.value: EstadoLote.EMPAQUETANDO.value,
    EstadoLote.EMPAQUETANDO.value: EstadoLote.TERMINADO.value,
    EstadoLote.TERMINADO.value: EstadoLote.ENVIADO.value
}


def crear_lote_produccion(db: Session, lote: schemas.LoteProduccionCreate) -> schemas.LoteProduccion:
    db_producto = producto_services.leer_producto(db, lote.producto_id)
    if not db_producto.activo:
        raise exceptions.ProductoDadoDeBaja()

    _lote = LoteProduccion(**lote.model_dump())
    db.add(_lote)
    db.commit()
    db.refresh(_lote)
    return leer_lote_produccion(db, _lote.id)


def listar_lotes_produccion(db: Session) -> List[schemas.LoteProduccionDetalle]:
    return db.scalars(select(LoteProduccion).options(joinedload(LoteProduccion.producto).
                                                joinedload(Producto.unidad_medida),
                                                selectinload(LoteProduccion.insumos_utilizados).joinedload(InsumoUtilizado.insumo).
                                                joinedload(Insumo.unidad_medida))).all()


def leer_lote_produccion(db: Session, lote_id: int) -> schemas.LoteProduccionDetalle:
    db_lote = db.scalar(select(LoteProduccion).where(LoteProduccion.id == lote_id)
                        .options(joinedload(LoteProduccion.producto).joinedload(Producto.unidad_medida),
                                selectinload(LoteProduccion.insumos_utilizados).joinedload(InsumoUtilizado.insumo).
                                joinedload(Insumo.unidad_medida)))
    if db_lote is None:
        raise exceptions.LoteProduccionNoEncontrado()
    return db_lote


def listar_lotes_por_producto(db: Session, producto_id: int) -> List[schemas.LoteProduccion]:
    return db.scalars(select(LoteProduccion).where(LoteProduccion.producto_id == producto_id)
                    .options(joinedload(LoteProduccion.producto).joinedload(Producto.unidad_medida))).all()


def cambiar_estado_lote_produccion(db: Session, lote_id: int) -> schemas.LoteProduccion:
    db_lote = leer_lote_produccion(db, lote_id)

    if db_lote.estado == EstadoLote.ENVIADO.value:
        raise exceptions.LoteYaEnviado()

    db_lote.estado = SIGUIENTE_ESTADO[db_lote.estado]
    db.commit()
    db.refresh(db_lote)
    return db_lote


def modificar_lote_produccion(db: Session, lote_id: int, lote: schemas.LoteProduccionUpdate) -> schemas.LoteProduccion:
    db_lote = leer_lote_produccion(db, lote_id)
    if not db_lote.activo or db_lote.estado == EstadoLote.ENVIADO.value:
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


def obtener_estadisticas_produccion(db: Session, fecha_desde: date, fecha_hasta: date, producto_id: int | None = None) -> List[schemas.EstadisticaProduccion]:

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


def validar_lote_para_insumos(db: Session, lote_id: int) -> LoteProduccion:
    db_lote = db.get(LoteProduccion, lote_id)

    if db_lote is None:
        raise exceptions.LoteProduccionNoEncontrado()

    if not db_lote.activo or db_lote.estado != EstadoLote.EN_PRODUCCION.value:
        raise exceptions.LoteNoModificable()

    return db_lote


def validar_insumos(db: Session, insumos: list[schemas.InsumoUtilizadoCreate]) -> None:
    insumos_ids = [insumo.insumo_id for insumo in insumos]

    if len(insumos_ids) != len(set(insumos_ids)):
        raise exceptions.InsumoRepetido()

    for insumo_id in insumos_ids:
        db_insumo = db.scalar(select(Insumo).where(Insumo.id == insumo_id, Insumo.tipo_herencia == "general"))

        if db_insumo is None:
            raise exceptions.InsumoNoEncontrado()

        if not db_insumo.activo:
            raise exceptions.InsumoDadoDeBaja()


def listar_insumos_lote(db: Session, lote_id: int) -> list[InsumoUtilizado]:
    db_lote = leer_lote_produccion(db, lote_id)
    return db_lote.insumos_utilizados


def asociar_insumos_lote(db: Session, lote_id: int, datos: schemas.InsumosUtilizadosCreate) -> list[InsumoUtilizado]:
    validar_lote_para_insumos(db, lote_id)
    validar_insumos(db, datos.insumos)

    insumos_ids = [insumo.insumo_id for insumo in datos.insumos]
    existentes = db.scalars(select(InsumoUtilizado).where(
        InsumoUtilizado.lote_produccion_id == lote_id,
        InsumoUtilizado.insumo_id.in_(insumos_ids)
    )).all()

    if existentes:
        raise exceptions.InsumoYaAsociado()

    for insumo in datos.insumos:
        db.add(InsumoUtilizado(
            lote_produccion_id=lote_id,
            insumo_id=insumo.insumo_id,
            cantidad_utilizada=insumo.cantidad_utilizada
        ))

    db.commit()
    return listar_insumos_lote(db, lote_id)


def actualizar_insumos_lote(db: Session, lote_id: int, datos: schemas.InsumosUtilizadosUpdate) -> list[InsumoUtilizado]:
    validar_lote_para_insumos(db, lote_id)
    validar_insumos(db, datos.insumos)

    db.execute(delete(InsumoUtilizado).where(InsumoUtilizado.lote_produccion_id == lote_id))

    for insumo in datos.insumos:
        db.add(InsumoUtilizado(
            lote_produccion_id=lote_id,
            insumo_id=insumo.insumo_id,
            cantidad_utilizada=insumo.cantidad_utilizada
        ))

    db.commit()
    db.expire_all()

    return listar_insumos_lote(db, lote_id)

