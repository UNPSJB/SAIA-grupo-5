import logging
from datetime import date
from typing import List
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload
from src.pedidos_proveedor.models import PedidoProveedor, PedidoProveedorItem
from src.pedidos_proveedor.constants import EstadoPedidoProveedor
from src.pedidos_proveedor import exceptions, schemas
from src.proveedor.models import Proveedor, ProveedorInsumo
from src.insumos.models import Insumo

logger = logging.getLogger(__name__)


def _query_base_pedidos():
    return select(PedidoProveedor).options(selectinload(PedidoProveedor.proveedor),
        selectinload(PedidoProveedor.registrado_por), selectinload(PedidoProveedor.items)
        .joinedload(PedidoProveedorItem.insumo).joinedload(Insumo.unidad_medida))


def listar_pedidos_proveedor(db: Session) -> List[schemas.PedidoProveedor]:
    return db.scalars(_query_base_pedidos().order_by(PedidoProveedor.fecha_pedido.desc(), PedidoProveedor.id.desc())).all()


def leer_pedido_proveedor(db: Session, pedido_id: int) -> schemas.PedidoProveedor:
    db_pedido = db.scalars(_query_base_pedidos().where(PedidoProveedor.id == pedido_id)).first()

    if db_pedido is None:
        raise exceptions.PedidoProveedorNoEncontrado()
    return db_pedido


def _validar_items_contra_proveedor(db: Session, proveedor_id: int, items: list[schemas.PedidoProveedorItemCreate]):
    if not items or len(items) == 0:
        raise exceptions.PedidoSinInsumos()

    insumos_ids = [item.insumo_id for item in items]
    if len(insumos_ids) != len(set(insumos_ids)):
        raise exceptions.InsumosRepetidos()

    asociados_validos = db.scalars(
        select(ProveedorInsumo.insumo_id).join(Insumo, ProveedorInsumo.insumo_id == Insumo.id)
        .where(ProveedorInsumo.proveedor_id == proveedor_id,
            ProveedorInsumo.insumo_id.in_(insumos_ids),
            Insumo.activo == True,)).all()

    if len(asociados_validos) != len(insumos_ids):
        raise exceptions.InsumoNoPerteneceAProveedor()


def crear_pedido_proveedor(
    db: Session, pedido: schemas.PedidoProveedorCreate, usuario_id: int) -> schemas.PedidoProveedor:
    proveedor = db.scalars(select(Proveedor).where(Proveedor.id == pedido.proveedor_id)).first()

    if not proveedor or not proveedor.activo:
        raise exceptions.ProveedorNoExisteOInactivo()

    if not proveedor.numero_habilitacion or not proveedor.vencimiento_habilitacion:
        raise exceptions.ProveedorSinHabilitacion()

    if proveedor.vencimiento_habilitacion < date.today():
        raise exceptions.HabilitacionProveedorVencida()

    _validar_items_contra_proveedor(db, pedido.proveedor_id, pedido.items)

    nuevo_pedido = PedidoProveedor(
        proveedor_id=pedido.proveedor_id,
        registrado_por_id=usuario_id,
        fecha_pedido=date.today(),
        fecha_entrega_estimada=pedido.fecha_entrega_estimada,
        observacion=pedido.observacion.strip() if pedido.observacion else None,
        estado=EstadoPedidoProveedor.PENDIENTE,
    )
    db.add(nuevo_pedido)
    db.flush()

    for item in pedido.items:
        db.add(
            PedidoProveedorItem(
                pedido_id=nuevo_pedido.id,
                insumo_id=item.insumo_id,
                cantidad_pedida=item.cantidad_pedida,
            )
        )

    db.commit()
    return leer_pedido_proveedor(db, nuevo_pedido.id)


def modificar_pedido_proveedor(
    db: Session, pedido_id: int, datos: schemas.PedidoProveedorUpdate) -> schemas.PedidoProveedor:
    db_pedido = leer_pedido_proveedor(db, pedido_id)

    if db_pedido.estado != EstadoPedidoProveedor.PENDIENTE or not db_pedido.activo:
        raise exceptions.PedidoNoEditable()

    _validar_items_contra_proveedor(db, db_pedido.proveedor_id, datos.items)

    db_pedido.fecha_entrega_estimada = datos.fecha_entrega_estimada
    db_pedido.observacion = datos.observacion.strip() if datos.observacion else None

    db.execute(delete(PedidoProveedorItem).where(PedidoProveedorItem.pedido_id == pedido_id))

    for item in datos.items:
        db.add(
            PedidoProveedorItem(
                pedido_id=pedido_id,
                insumo_id=item.insumo_id,
                cantidad_pedida=item.cantidad_pedida,
            )
        )

    db.commit()
    db.refresh(db_pedido, attribute_names=["items"])
    return leer_pedido_proveedor(db, pedido_id)


def cambiar_estado_pedido_proveedor(db: Session, pedido_id: int) -> schemas.PedidoProveedor:
    db_pedido = leer_pedido_proveedor(db, pedido_id)

    if db_pedido.estado != EstadoPedidoProveedor.PENDIENTE:
        raise exceptions.PedidoNoEditable()

    db_pedido.activo = not db_pedido.activo
    db.commit()
    return leer_pedido_proveedor(db, pedido_id)