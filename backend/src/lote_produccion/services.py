import logging
from typing import List, Literal
from datetime import date
from sqlalchemy import select, func, delete
from sqlalchemy.orm import Session, joinedload, selectinload
from src.lote_produccion.models import LoteProduccion, EstadoLote, InsumoUtilizado
from src.lote_produccion import schemas, exceptions
from src.producto.models import Producto
from src.producto import services as producto_services
from src.lote_produccion.models import HistorialEstadoLote
from src.insumos_lote.models import InsumoLote
from src.insumos_lote.services import descontar_stock_insumo_lote
from src.insumos.models import Insumo
from src.lote_proveedor.models import LoteProveedor

logger = logging.getLogger(__name__)

SIGUIENTE_ESTADO ={
    EstadoLote.EN_PRODUCCION.value: EstadoLote.EMPAQUETANDO.value,
    EstadoLote.EMPAQUETANDO.value: EstadoLote.TERMINADO.value,
}


def crear_lote_produccion(db: Session, lote: schemas.LoteProduccionCreate, usuario_id: int) -> schemas.LoteProduccion:
    db_producto = producto_services.leer_producto(db, lote.producto_id)
    if not db_producto.activo:
        raise exceptions.ProductoDadoDeBaja()

    datos = lote.model_dump()
    if "cantidad_disponible" not in datos or datos["cantidad_disponible"] is None:
        datos["cantidad_disponible"] = lote.cantidad_producida

    _lote = LoteProduccion(**datos)
    db.add(_lote)
    db.commit()
    db.refresh(_lote)

    primer_hito = HistorialEstadoLote(
        lote_id=_lote.id,
        estado=_lote.estado,
        usuario_id=usuario_id,
        observacion="Creacion del lote de producción e inicio de la produccion.")
    
    db.add(primer_hito)
    db.commit()

    return leer_lote_produccion(db, _lote.id)


def listar_lotes_produccion(db: Session) -> List[schemas.LoteProduccionDetalle]:
    return db.scalars(select(LoteProduccion).options(joinedload(LoteProduccion.producto).
                                                joinedload(Producto.unidad_medida),
                                                selectinload(LoteProduccion.insumos_utilizados).joinedload(InsumoUtilizado.insumo_lote).
                                                joinedload(InsumoLote.insumo).
                                                joinedload(Insumo.unidad_medida))).all()


def leer_lote_produccion(db: Session, lote_id: int) -> schemas.LoteProduccionDetalle:
    db_lote = db.scalar(
        select(LoteProduccion).where(LoteProduccion.id == lote_id).options(
            joinedload(LoteProduccion.producto).joinedload(Producto.unidad_medida),
            selectinload(LoteProduccion.insumos_utilizados).joinedload(InsumoUtilizado.insumo_lote)
            .joinedload(InsumoLote.insumo).joinedload(Insumo.unidad_medida),
            selectinload(LoteProduccion.insumos_utilizados).joinedload(InsumoUtilizado.insumo_lote)
            .joinedload(InsumoLote.lote_proveedor).joinedload(LoteProveedor.proveedor)))
    
    if db_lote is None:
        raise exceptions.LoteProduccionNoEncontrado()
    return db_lote


def listar_lotes_por_producto(db: Session, producto_id: int) -> List[schemas.LoteProduccion]:
    return db.scalars(select(LoteProduccion).where(LoteProduccion.producto_id == producto_id)
                    .options(joinedload(LoteProduccion.producto).joinedload(Producto.unidad_medida))).all()


def cambiar_estado_lote_produccion(db: Session, lote_id: int, usuario_id: int, observacion: str | None = None) -> schemas.LoteProduccion:
    db_lote = leer_lote_produccion(db, lote_id)

    if not db_lote.producto.activo:
        raise exceptions.ProductoDadoDeBaja()

    if db_lote.estado not in SIGUIENTE_ESTADO:
        raise exceptions.LoteYaEnviado()

    nuevo_estado = SIGUIENTE_ESTADO[db_lote.estado]
    db_lote.estado = nuevo_estado

    hito = HistorialEstadoLote(
        lote_id=db_lote.id,
        estado=nuevo_estado,
        usuario_id=usuario_id,
        observacion=observacion.strip() if observacion else None)

    db.add(hito)
    db.commit()
    db.refresh(db_lote)
    return db_lote


def modificar_lote_produccion(db: Session, lote_id: int, lote: schemas.LoteProduccionUpdate) -> schemas.LoteProduccion:
    db_lote = leer_lote_produccion(db, lote_id)
    if not db_lote.activo or db_lote.estado in [
        EstadoLote.ENVIADO.value,
        EstadoLote.PARCIALMENTE_DESPACHADO.value]:
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


def validar_insumos_lote(db: Session, insumos: list[schemas.InsumoUtilizadoCreate]) -> None:
    insumos_ids = [item.insumo_lote_id for item in insumos]

    if len(insumos_ids) != len(set(insumos_ids)):
        raise exceptions.InsumoRepetido()

    hoy = date.today()

    for item in insumos:
        insumo_lote = db.scalar(select(InsumoLote).where(InsumoLote.id == item.insumo_lote_id))

        if not insumo_lote:
            raise exceptions.InsumoLoteNoEncontrado()

        if not insumo_lote.activo:
            raise exceptions.InsumoLoteInactivo()

        if insumo_lote.fecha_vencimiento <= hoy:
            raise exceptions.InsumoLoteVencido()

        if (insumo_lote.fecha_vencimiento - hoy).days < 15:
            raise exceptions.InsumoLoteProximoAVencer()

        if insumo_lote.cantidad_restante < item.cantidad_utilizada:
            raise exceptions.StockInsuficienteInsumoLote()


def listar_insumos_lote(db: Session, lote_id: int) -> list[InsumoUtilizado]:
    db_lote = leer_lote_produccion(db, lote_id)
    return db_lote.insumos_utilizados


def asociar_insumos_lote(db: Session, lote_id: int, datos: schemas.InsumosUtilizadosCreate) -> list[InsumoUtilizado]:
    validar_lote_para_insumos(db, lote_id)
    validar_insumos_lote(db, datos.insumos)

    insumos_ids = [insumo.insumo_lote_id for insumo in datos.insumos]
    existentes = db.scalars(select(InsumoUtilizado).where(
        InsumoUtilizado.lote_produccion_id == lote_id,
        InsumoUtilizado.insumo_lote_id.in_(insumos_ids))).all()

    if existentes:
        raise exceptions.InsumoYaAsociado()

    for item in datos.insumos:
        db.add(InsumoUtilizado(
            lote_produccion_id=lote_id,
            insumo_lote_id=item.insumo_lote_id,
            cantidad_utilizada=item.cantidad_utilizada
        ))
        
        descontar_stock_insumo_lote(db, item.insumo_lote_id, int(item.cantidad_utilizada))

    db.commit()
    return listar_insumos_lote(db, lote_id)


def actualizar_insumos_lote(db: Session, lote_id: int, datos: schemas.InsumosUtilizadosUpdate) -> list[InsumoUtilizado]:
    validar_lote_para_insumos(db, lote_id)
    validar_insumos_lote(db, datos.insumos)

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

def listar_historial_lote(db: Session, lote_id: int) -> list[HistorialEstadoLote]:
    return db.scalars(select(HistorialEstadoLote).where(HistorialEstadoLote.lote_id == lote_id).options(joinedload(HistorialEstadoLote.usuario))
        .order_by(HistorialEstadoLote.fecha_hora.asc())).all()