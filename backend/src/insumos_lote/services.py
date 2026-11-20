from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from src.insumos_lote.models import InsumoLote
from src.insumos_lote import schemas, exceptions
from src.insumos.models import Insumo
from src.lote_proveedor.models import LoteProveedor
from src.lote_produccion.models import InsumoUtilizado, LoteProduccion
from src.envios_lote.models import EnvioLote

def listar_insumos_de_lote(db: Session, lote_proveedor_id: int) -> list[InsumoLote]:
    lote = db.get(LoteProveedor, lote_proveedor_id)
    consulta = (
        select(InsumoLote)
        .where(InsumoLote.lote_proveedor_id == lote_proveedor_id)
        .options(
            joinedload(InsumoLote.insumo).joinedload(Insumo.unidad_medida),
            joinedload(InsumoLote.lote_proveedor).joinedload(LoteProveedor.proveedor),
        )
    )
    if lote and lote.estado != "acomodado":
        consulta = consulta.where(InsumoLote.activo == True)
    return db.scalars(consulta).all()


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
    from src.notificaciones.services import (
        generar_notificaciones_alerta_stock,
        generar_notificaciones_vencimiento_insumo_lote,
    )
    generar_notificaciones_alerta_stock(db)
    generar_notificaciones_vencimiento_insumo_lote(db)
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


def obtener_trazabilidad_insumo_lote(db: Session, insumo_lote_id: int) -> schemas.TrazabilidadInsumoLote:
    insumo_lote = db.scalar(
        select(InsumoLote)
        .where(InsumoLote.id == insumo_lote_id)
        .options(
            joinedload(InsumoLote.insumo).joinedload(Insumo.unidad_medida),
            joinedload(InsumoLote.lote_proveedor).joinedload(LoteProveedor.proveedor),
            joinedload(InsumoLote.producciones_asociadas)
            .joinedload(InsumoUtilizado.lote_produccion)
            .joinedload(LoteProduccion.producto),
            joinedload(InsumoLote.producciones_asociadas)
            .joinedload(InsumoUtilizado.lote_produccion)
            .joinedload(LoteProduccion.envios)
            .joinedload(EnvioLote.cliente),
            joinedload(InsumoLote.producciones_asociadas)
            .joinedload(InsumoUtilizado.lote_produccion)
            .joinedload(LoteProduccion.envios)
            .joinedload(EnvioLote.direccion),
        )
    )
    if not insumo_lote:
        raise exceptions.InsumoLoteNoEncontrado()

    lote_proveedor = insumo_lote.lote_proveedor
    proveedor = lote_proveedor.proveedor if lote_proveedor else None
    unidad_medida = "Unidades"
    if insumo_lote.insumo and insumo_lote.insumo.unidad_medida:
        unidad_medida = insumo_lote.insumo.unidad_medida.nombre

    producciones = []
    for asociacion in insumo_lote.producciones_asociadas:
        lote_produccion = asociacion.lote_produccion
        if not lote_produccion:
            continue
        envios = []
        for envio in lote_produccion.envios:
            direccion_completa = ""
            if envio.direccion:
                direccion_completa = (
                    f"{envio.direccion.calle_altura}, {envio.direccion.localidad} ({envio.direccion.provincia})"
                )
            envios.append(
                schemas.TrazabilidadEnvioAfectado(
                    envio_id=envio.id,
                    numero_remito=envio.numero_remito,
                    fecha_envio=envio.fecha_envio,
                    estado=envio.estado,
                    cantidad=envio.cantidad,
                    cliente_id=envio.cliente_id,
                    cliente_razon_social=envio.cliente.razon_social if envio.cliente else "Cliente",
                    cliente_cuit=envio.cliente.cuit if envio.cliente else "",
                    direccion=direccion_completa,
                )
            )
        producciones.append(
            schemas.TrazabilidadProduccionAfectada(
                lote_produccion_id=lote_produccion.id,
                producto_nombre=lote_produccion.producto.nombre if lote_produccion.producto else "Producto",
                fecha_produccion=lote_produccion.fecha_produccion,
                fecha_vencimiento=lote_produccion.fecha_vencimiento,
                estado=lote_produccion.estado,
                cantidad_producida=lote_produccion.cantidad_producida,
                cantidad_utilizada=asociacion.cantidad_utilizada,
                unidad_medida=unidad_medida,
                envios=envios,
            )
        )

    return schemas.TrazabilidadInsumoLote(
        insumo_lote_id=insumo_lote.id,
        insumo_nombre=insumo_lote.insumo.nombre if insumo_lote.insumo else "Insumo",
        marca=insumo_lote.marca,
        numero_lote_insumo=insumo_lote.numero_lote,
        fecha_vencimiento=insumo_lote.fecha_vencimiento,
        cantidad=insumo_lote.cantidad,
        cantidad_restante=insumo_lote.cantidad_restante,
        unidad_medida=unidad_medida,
        lote_proveedor_id=lote_proveedor.id if lote_proveedor else None,
        numero_remito=lote_proveedor.numero_remito if lote_proveedor else None,
        fecha_recepcion=lote_proveedor.fecha_recepcion if lote_proveedor else None,
        proveedor_id=proveedor.id if proveedor else None,
        proveedor_nombre=proveedor.nombre if proveedor else None,
        proveedor_cuit=proveedor.cuit if proveedor else None,
        producciones=producciones,
    )


def descontar_stock_insumo_lote(db: Session, insumo_lote_id: int, cantidad_a_descontar: int) -> InsumoLote:
    insumo_lote = leer_insumo_lote(db, insumo_lote_id)

    insumo_lote.cantidad_restante = max(0, insumo_lote.cantidad_restante - cantidad_a_descontar)
    
    if insumo_lote.cantidad_restante == 0:
        insumo_lote.activo = False

    db.commit()
    db.refresh(insumo_lote)

    # Alerta stock
    # para evitar import circular ya que notificaciones importa insumos_lote.services
    from src.notificaciones.services import generar_notificacion_alerta_stock_individual
    generar_notificacion_alerta_stock_individual(db, insumo_lote.id)

    return insumo_lote