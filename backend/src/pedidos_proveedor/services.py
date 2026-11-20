import logging
from datetime import date, timedelta
from typing import List
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload, selectinload
from src.pedidos_proveedor.models import PedidoProveedor, PedidoProveedorItem
from src.pedidos_proveedor.constants import EstadoPedidoProveedor
from src.pedidos_proveedor import exceptions, schemas
from src.proveedor.models import Proveedor, ProveedorInsumo
from src.insumos.models import Insumo
from src.insumos_lote.models import InsumoLote

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


def obtener_sugerencias_reposicion(db: Session) -> schemas.SugerenciasReposicionResponse:
    hoy = date.today()
    fecha_limite = hoy + timedelta(days=15)

    lotes_insumo = db.scalars(
        select(InsumoLote)
        .options(joinedload(InsumoLote.insumo).joinedload(Insumo.unidad_medida))
    ).all()

    insumos_en_pedido_pendiente = set(
        db.scalars(
            select(PedidoProveedorItem.insumo_id)
            .join(PedidoProveedor, PedidoProveedorItem.pedido_id == PedidoProveedor.id)
            .where(
                PedidoProveedor.activo.is_(True),
                PedidoProveedor.estado == EstadoPedidoProveedor.PENDIENTE,
            )).all()
    )

    insumos_unicos: list[Insumo] = []
    ids_vistos: set[int] = set()
    for insumo_lote in lotes_insumo:
        if insumo_lote.insumo and insumo_lote.insumo.activo and insumo_lote.insumo_id not in ids_vistos:
            ids_vistos.add(insumo_lote.insumo_id)
            insumos_unicos.append(insumo_lote.insumo)

    lista_criticos: list[schemas.InsumoReposicionSugerido] = []
    for insumo in insumos_unicos:
        lotes_del_insumo = [
            insumo_lote for insumo_lote in lotes_insumo if insumo_lote.insumo_id == insumo.id
        ]
        stock_disponible = sum(
            insumo_lote.cantidad_restante
            for insumo_lote in lotes_del_insumo
            if insumo_lote.activo and insumo_lote.cantidad_restante > 0 and insumo_lote.fecha_vencimiento >= fecha_limite
        )
        minimo_alerta = max(
            (insumo_lote.minimo_alerta or 0) for insumo_lote in lotes_del_insumo
        )
        tiene_lote_en_riesgo = any(
            (insumo_lote.minimo_alerta is not None and insumo_lote.cantidad_restante <= insumo_lote.minimo_alerta)
            or (insumo_lote.cantidad_restante > 0 and insumo_lote.fecha_vencimiento < fecha_limite)
            for insumo_lote in lotes_del_insumo
        )

        if stock_disponible <= minimo_alerta or tiene_lote_en_riesgo:
            unidad_medida = insumo.unidad_medida.nombre if insumo.unidad_medida else "Unidades"
            cantidad_sugerida = (
                max(1, (minimo_alerta * 2) - stock_disponible)
                if minimo_alerta > 0
                else max(1, 10 - stock_disponible)
            )
            lista_criticos.append(
                schemas.InsumoReposicionSugerido(
                    insumo_id=insumo.id,
                    insumo_nombre=insumo.nombre,
                    unidad_medida=unidad_medida,
                    stock_disponible=stock_disponible,
                    minimo_alerta=minimo_alerta,
                    cantidad_sugerida=cantidad_sugerida,
                    tiene_pedido_pendiente=insumo.id in insumos_en_pedido_pendiente,
                )
            )

    if not lista_criticos:
        return schemas.SugerenciasReposicionResponse()

    ids_criticos = [item.insumo_id for item in lista_criticos]
    relaciones_proveedor = db.scalars(
        select(ProveedorInsumo)
        .options(joinedload(ProveedorInsumo.proveedor))
        .where(ProveedorInsumo.insumo_id.in_(ids_criticos))
    ).all()

    lista_por_proveedor: list[schemas.ProveedorReposicionSugerido] = []
    insumos_con_proveedor: set[int] = set()

    for relacion in relaciones_proveedor:
        proveedor = relacion.proveedor
        if not proveedor or not proveedor.activo:
            continue
        if (
            not proveedor.numero_habilitacion
            or not proveedor.vencimiento_habilitacion
            or proveedor.vencimiento_habilitacion < hoy
        ):
            continue

        insumo_sugerido = next(
            (item for item in lista_criticos if item.insumo_id == relacion.insumo_id),
            None,
        )
        if not insumo_sugerido:
            continue

        insumos_con_proveedor.add(relacion.insumo_id)
        proveedor_existente = next(
            (grupo for grupo in lista_por_proveedor if grupo.proveedor_id == proveedor.id),
            None,
        )
        if proveedor_existente is None:
            proveedor_existente = schemas.ProveedorReposicionSugerido(
                proveedor_id=proveedor.id,
                proveedor_nombre=proveedor.nombre,
                cuit=proveedor.cuit,
                insumos=[],
            )
            lista_por_proveedor.append(proveedor_existente)

        proveedor_existente.insumos.append(insumo_sugerido)

    insumos_sin_proveedor = [
        item for item in lista_criticos if item.insumo_id not in insumos_con_proveedor
    ]

    return schemas.SugerenciasReposicionResponse(
        por_proveedor=lista_por_proveedor,
        insumos_sin_proveedor=insumos_sin_proveedor,
    )