from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from src.insumos_lote.models import InsumoLote
from src.insumos_lote import schemas, exceptions
from src.insumos.models import Insumo
from src.lote_proveedor.models import LoteProveedor
from src.lote_produccion.models import InsumoUtilizado

def listar_insumos_de_lote(db: Session, lote_proveedor_id: int) -> list[InsumoLote]:
    return db.scalars(
        select(InsumoLote).where(InsumoLote.lote_proveedor_id == lote_proveedor_id,InsumoLote.activo == True)
        .options(joinedload(InsumoLote.insumo)
                .joinedload(Insumo.unidad_medida),
                joinedload(InsumoLote.lote_proveedor)
                .joinedload(LoteProveedor.proveedor))).all()


def agregar_insumo_a_lote(db: Session, lote_proveedor_id: int, datos: schemas.InsumoLoteCreate) -> InsumoLote:
    lote = db.scalar(select(LoteProveedor).where(LoteProveedor.id == lote_proveedor_id))

    if not lote:
        raise exceptions.LoteProveedorNoEncontrado()

    insumo_catalogo = db.scalar(select(Insumo).where(Insumo.id == datos.insumo_id, Insumo.activo == True))

    if not insumo_catalogo:
        raise exceptions.InsumoNoEncontradoOInactivo()

    ya_registrado = db.scalar(
        select(InsumoLote).where(
            InsumoLote.lote_proveedor_id == lote_proveedor_id,
            InsumoLote.insumo_id == datos.insumo_id,
            InsumoLote.activo == True,
        )
    )
    if ya_registrado:
        raise exceptions.InsumoYaRegistradoEnLote()

    if lote.pedido_id is not None and lote.pedido:
        ids_pedido = {item.insumo_id for item in lote.pedido.items}
        if datos.insumo_id not in ids_pedido:
            raise exceptions.InsumoNoEnPedido()

    nuevo_insumo_lote = InsumoLote(
        lote_proveedor_id=lote_proveedor_id,
        insumo_id=datos.insumo_id,
        numero_lote=datos.numero_lote.strip(),
        marca=datos.marca.strip(),
        cantidad=datos.cantidad,
        cantidad_restante=datos.cantidad,
        fecha_vencimiento=datos.fecha_vencimiento,
        costo_unitario=datos.costo_unitario,
        minimo_alerta=datos.minimo_alerta,
        activo=True,
    )
    db.add(nuevo_insumo_lote)
    db.commit()
    db.refresh(nuevo_insumo_lote)
    return nuevo_insumo_lote


def listar_todos_los_insumos_lote(db: Session) -> list[InsumoLote]:
    return db.scalars(
        select(InsumoLote).options(
            joinedload(InsumoLote.insumo).joinedload(Insumo.unidad_medida),
            joinedload(InsumoLote.lote_proveedor).joinedload(LoteProveedor.proveedor))).all()


def leer_insumo_lote(db: Session, insumo_lote_id: int) -> InsumoLote:
    insumo_lote = db.scalar(
        select(InsumoLote).where(InsumoLote.id == insumo_lote_id).options(
            joinedload(InsumoLote.insumo).joinedload(Insumo.unidad_medida),
            joinedload(InsumoLote.lote_proveedor).joinedload(LoteProveedor.proveedor),
            joinedload(InsumoLote.producciones_asociadas)
            .joinedload(InsumoUtilizado.lote_produccion)
        )
    )
    
    if not insumo_lote:
        raise exceptions.InsumoLoteNoEncontrado()
    return insumo_lote


def eliminar_insumo_de_lote(db: Session, insumo_lote_id: int) -> None:
    insumo_lote = leer_insumo_lote(db, insumo_lote_id)
    insumo_lote.activo = False
    db.commit()


def cambiar_estado_insumo_lote(db: Session, insumo_lote_id: int) -> InsumoLote:
    insumo_lote = leer_insumo_lote(db, insumo_lote_id)

    if not insumo_lote.activo:
        if insumo_lote.cantidad_restante <= 0:
            raise exceptions.InsumoSinStockNoReactivable()
        insumo_lote.activo = True
    else:
        insumo_lote.activo = False

    db.commit()
    db.refresh(insumo_lote)
    return insumo_lote


def descontar_stock_insumo_lote(db: Session, insumo_lote_id: int, cantidad_a_descontar: int) -> InsumoLote:
    insumo_lote = leer_insumo_lote(db, insumo_lote_id)

    insumo_lote.cantidad_restante = max(0, insumo_lote.cantidad_restante - cantidad_a_descontar)
    
    if insumo_lote.cantidad_restante == 0:
        insumo_lote.activo = False

    db.commit()
    db.refresh(insumo_lote)
    return insumo_lote