import logging
import math
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
from src.envios_lote.models import EnvioLote
from src.equipos import exceptions as equipo_exceptions
from src.equipos.models import Equipo
from src.notificaciones.services import generar_notificacion_alerta_stock_individual
from src.sector import exceptions as sector_exceptions
from src.sector.models import Sector
from src.supervision_lote import services as supervision_services
from src.lote_produccion.receta_lote import buscar_receta_para_lote
from src.receta.models import Receta, InsumoReceta

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

    receta = buscar_receta_para_lote(db, lote.producto_id, lote.fecha_produccion)
    datos["receta_id"] = receta.id if receta else None

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

    supervision_services.generar_checklist_elaboracion_lote(db, _lote)

    return leer_lote_produccion(db, _lote.id)


def listar_lotes_produccion(db: Session) -> List[schemas.LoteProduccionDetalle]:
    return db.scalars(select(LoteProduccion).options(joinedload(LoteProduccion.producto).
                                                joinedload(Producto.unidad_medida),
                                                joinedload(LoteProduccion.equipo).joinedload(Equipo.sector),
                                                joinedload(LoteProduccion.sector),
                                                joinedload(LoteProduccion.receta).selectinload(Receta.insumos),
                                                selectinload(LoteProduccion.supervisiones),
                                                selectinload(LoteProduccion.insumos_utilizados).joinedload(InsumoUtilizado.insumo_lote).
                                                joinedload(InsumoLote.insumo).
                                                joinedload(Insumo.unidad_medida))).all()


def leer_lote_produccion(db: Session, lote_id: int) -> schemas.LoteProduccionDetalle:
    db_lote = db.scalar(
        select(LoteProduccion).where(LoteProduccion.id == lote_id).options(
            joinedload(LoteProduccion.producto).joinedload(Producto.unidad_medida),
            joinedload(LoteProduccion.equipo).joinedload(Equipo.sector),
            joinedload(LoteProduccion.sector),
            joinedload(LoteProduccion.receta).selectinload(Receta.insumos).joinedload(InsumoReceta.insumo).joinedload(Insumo.unidad_medida),
            selectinload(LoteProduccion.supervisiones),
            selectinload(LoteProduccion.insumos_utilizados).joinedload(InsumoUtilizado.insumo_lote)
            .joinedload(InsumoLote.insumo).joinedload(Insumo.unidad_medida),
            selectinload(LoteProduccion.insumos_utilizados).joinedload(InsumoUtilizado.insumo_lote)
            .joinedload(InsumoLote.lote_proveedor).joinedload(LoteProveedor.proveedor)))
    
    if db_lote is None:
        raise exceptions.LoteProduccionNoEncontrado()
    return db_lote


def listar_lotes_por_producto(db: Session, producto_id: int) -> List[schemas.LoteProduccion]:
    return db.scalars(select(LoteProduccion).where(LoteProduccion.producto_id == producto_id)
                    .options(joinedload(LoteProduccion.producto).joinedload(Producto.unidad_medida),
                             selectinload(LoteProduccion.supervisiones))).all()


def validar_tope_insumos_receta(db: Session, db_lote: LoteProduccion, nuevos_items: list[schemas.InsumoUtilizadoCreate], reemplazar: bool = False) -> None:
    receta = db_lote.receta
    if receta is None:
        receta = buscar_receta_para_lote(db, db_lote.producto_id, db_lote.fecha_produccion)
    if receta is None or not receta.insumos:
        return

    requerido_por_insumo = {
        item.insumo_id: math.ceil(item.cantidad * db_lote.cantidad_producida)
        for item in receta.insumos
    }
    nombres_insumo = {
        item.insumo_id: item.insumo.nombre if item.insumo else f"Insumo #{item.insumo_id}"
        for item in receta.insumos
    }

    totales: dict[int, int] = {}
    if not reemplazar:
        for usado in db_lote.insumos_utilizados:
            if usado.insumo_lote:
                ins_id = usado.insumo_lote.insumo_id
                totales[ins_id] = totales.get(ins_id, 0) + int(usado.cantidad_utilizada)

    for item in nuevos_items:
        insumo_lote = db.get(InsumoLote, item.insumo_lote_id)
        if insumo_lote:
            ins_id = insumo_lote.insumo_id
            totales[ins_id] = totales.get(ins_id, 0) + int(item.cantidad_utilizada)

    for ins_id, requerido in requerido_por_insumo.items():
        if totales.get(ins_id, 0) > requerido:
            raise exceptions.CantidadInsumoExcedeReceta(
                f"La cantidad asociada de {nombres_insumo[ins_id]} ({totales[ins_id]}) supera lo requerido por la receta ({requerido})."
            )


def validar_insumos_suficientes_lote(db: Session, db_lote: LoteProduccion) -> None:
    receta = db_lote.receta
    if receta is None:
        receta = buscar_receta_para_lote(db, db_lote.producto_id, db_lote.fecha_produccion)
    if receta is None or not receta.insumos:
        raise exceptions.LoteSinRecetaParaAvanzar()

    asociados_por_insumo: dict[int, int] = {}
    for usado in db_lote.insumos_utilizados:
        if usado.insumo_lote:
            ins_id = usado.insumo_lote.insumo_id
            asociados_por_insumo[ins_id] = asociados_por_insumo.get(ins_id, 0) + int(usado.cantidad_utilizada)

    faltantes: list[str] = []
    for item in receta.insumos:
        requerido = math.ceil(item.cantidad * db_lote.cantidad_producida)
        asociado = asociados_por_insumo.get(item.insumo_id, 0)
        if asociado < requerido:
            nombre = item.insumo.nombre if item.insumo else f"Insumo #{item.insumo_id}"
            unidad = item.insumo.unidad_medida.nombre if item.insumo and item.insumo.unidad_medida else "u."
            faltantes.append(f"{nombre} ({asociado}/{requerido} {unidad})")

    if faltantes:
        raise exceptions.InsumosInsuficientesParaProduccion(
            "Faltan insumos requeridos por la receta para avanzar a Empaquetando: " + ", ".join(faltantes)
        )


def cambiar_estado_lote_produccion(db: Session, lote_id: int, usuario_id: int, observacion: str | None = None, equipo_id: int | None = None, sector_id: int | None = None) -> schemas.LoteProduccion:
    db_lote = leer_lote_produccion(db, lote_id)

    if not db_lote.producto.activo:
        raise exceptions.ProductoDadoDeBaja()

    if db_lote.estado not in SIGUIENTE_ESTADO:
        raise exceptions.LoteYaEnviado()

    supervision_services.validar_checklist_fase_completo(db, db_lote.id, db_lote.estado)

    if db_lote.estado == EstadoLote.EN_PRODUCCION.value:
        validar_insumos_suficientes_lote(db, db_lote)

    nuevo_estado = SIGUIENTE_ESTADO[db_lote.estado]
    db_lote.estado = nuevo_estado

    if nuevo_estado == EstadoLote.EMPAQUETANDO.value:
        supervision_services.generar_checklist_empaquetado_lote(db, db_lote)
    elif nuevo_estado == EstadoLote.TERMINADO.value:
        if equipo_id is not None:
            equipo_db = db.get(Equipo, equipo_id)
            if not equipo_db or not equipo_db.estado:
                raise equipo_exceptions.EquipoNoEncontrado()
            db_lote.equipo_id = equipo_id
            db_lote.sector_id = sector_id if sector_id is not None else equipo_db.sector_id
        elif sector_id is not None:
            sector_db = db.get(Sector, sector_id)
            if not sector_db or not sector_db.activo:
                raise sector_exceptions.SectorNoEncontrado()
            db_lote.sector_id = sector_id
            db_lote.equipo_id = None

    hito = HistorialEstadoLote(
        lote_id=db_lote.id,
        estado=nuevo_estado,
        usuario_id=usuario_id,
        observacion=observacion.strip() if observacion else None)

    db.add(hito)
    db.commit()
    return leer_lote_produccion(db, db_lote.id)


def modificar_lote_produccion(db: Session, lote_id: int, lote: schemas.LoteProduccionUpdate) -> schemas.LoteProduccion:
    db_lote = leer_lote_produccion(db, lote_id)
    if not db_lote.activo or db_lote.estado in [
        EstadoLote.ENVIADO.value,
        EstadoLote.PARCIALMENTE_DESPACHADO.value]:
        raise exceptions.LoteProduccionDadoDeBaja()

    db_producto = producto_services.leer_producto(db, lote.producto_id)
    if not db_producto.activo:
        raise exceptions.ProductoDadoDeBaja()

    lote_actualizado = lote.model_dump(exclude_unset=True)
    if "equipo_id" in lote_actualizado or "sector_id" in lote_actualizado:
        eq_id = lote_actualizado.get("equipo_id")
        sec_id = lote_actualizado.get("sector_id")
        if eq_id is not None:
            equipo_db = db.get(Equipo, eq_id)
            if not equipo_db or not equipo_db.estado:
                raise equipo_exceptions.EquipoNoEncontrado()
            lote_actualizado["sector_id"] = sec_id if sec_id is not None else equipo_db.sector_id
        elif sec_id is not None:
            sector_db = db.get(Sector, sec_id)
            if not sector_db or not sector_db.activo:
                raise sector_exceptions.SectorNoEncontrado()
            lote_actualizado["equipo_id"] = None

    cambia_receta = (
        lote_actualizado.get("producto_id", db_lote.producto_id) != db_lote.producto_id
        or lote_actualizado.get("fecha_produccion", db_lote.fecha_produccion) != db_lote.fecha_produccion
    )

    for key, value in lote_actualizado.items():
        setattr(db_lote, key, value)

    if cambia_receta:
        receta = buscar_receta_para_lote(db, db_lote.producto_id, db_lote.fecha_produccion)
        db_lote.receta_id = receta.id if receta else None

    db.commit()
    db.refresh(db_lote)
    return leer_lote_produccion(db, db_lote.id)


def actualizar_almacenamiento_lote_produccion(db: Session, lote_id: int, datos: schemas.ActualizarAlmacenamiento) -> schemas.LoteProduccion:
    db_lote = leer_lote_produccion(db, lote_id)
    if not db_lote.activo:
        raise exceptions.LoteProduccionDadoDeBaja()

    if datos.equipo_id is not None:
        equipo_db = db.get(Equipo, datos.equipo_id)
        if not equipo_db or not equipo_db.estado:
            raise equipo_exceptions.EquipoNoEncontrado()
        db_lote.equipo_id = datos.equipo_id
        db_lote.sector_id = datos.sector_id if datos.sector_id is not None else equipo_db.sector_id
    elif datos.sector_id is not None:
        sector_db = db.get(Sector, datos.sector_id)
        if not sector_db or not sector_db.activo:
            raise sector_exceptions.SectorNoEncontrado()
        db_lote.sector_id = datos.sector_id
        db_lote.equipo_id = None
    else:
        db_lote.equipo_id = None
        db_lote.sector_id = None

    db.commit()
    return leer_lote_produccion(db, db_lote.id)


def listar_lotes_historial(
    db: Session,
    orden: Literal["asc", "desc"] = "desc",
    producto_id: int | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
) -> schemas.LoteProduccionHistorial:

    consulta = (select(LoteProduccion).options(
        selectinload(LoteProduccion.producto),
        selectinload(LoteProduccion.receta),
        selectinload(LoteProduccion.supervisiones)
    ))

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
        if item.cantidad_utilizada != int(item.cantidad_utilizada):
            raise exceptions.CantidadInsumoNoEntera()

        insumo_lote = db.scalar(
            select(InsumoLote)
            .where(InsumoLote.id == item.insumo_lote_id)
            .options(joinedload(InsumoLote.insumo))
        )

        if not insumo_lote:
            raise exceptions.InsumoLoteNoEncontrado()

        if not insumo_lote.activo or (insumo_lote.insumo and not insumo_lote.insumo.activo):
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
    db_lote = leer_lote_produccion(db, lote_id)
    validar_lote_para_insumos(db, lote_id)
    validar_insumos_lote(db, datos.insumos)
    validar_tope_insumos_receta(db, db_lote, datos.insumos, reemplazar=False)

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
    db.expire_all()
    return listar_insumos_lote(db, lote_id)


def actualizar_insumos_lote(db: Session, lote_id: int, datos: schemas.InsumosUtilizadosUpdate) -> list[InsumoUtilizado]:
    db_lote = leer_lote_produccion(db, lote_id)
    validar_lote_para_insumos(db, lote_id)
    validar_tope_insumos_receta(db, db_lote, datos.insumos, reemplazar=True)

    anteriores = db.scalars(
        select(InsumoUtilizado).where(InsumoUtilizado.lote_produccion_id == lote_id)
    ).all()

    ids_afectados: set[int] = set()
    for registro_anterior in anteriores:
        insumo_lote = db.get(InsumoLote, registro_anterior.insumo_lote_id)
        if insumo_lote:
            estaba_en_cero = insumo_lote.cantidad_restante == 0
            insumo_lote.cantidad_restante += int(registro_anterior.cantidad_utilizada)
            if estaba_en_cero and insumo_lote.cantidad_restante > 0:
                insumo_lote.activo = True
            ids_afectados.add(insumo_lote.id)

    db.execute(delete(InsumoUtilizado).where(InsumoUtilizado.lote_produccion_id == lote_id))
    db.flush()

    validar_insumos_lote(db, datos.insumos)

    for insumo in datos.insumos:
        db.add(InsumoUtilizado(
            lote_produccion_id=lote_id,
            insumo_lote_id=insumo.insumo_lote_id,
            cantidad_utilizada=insumo.cantidad_utilizada
        ))
        insumo_lote = db.get(InsumoLote, insumo.insumo_lote_id)
        if insumo_lote:
            insumo_lote.cantidad_restante = max(0, insumo_lote.cantidad_restante - int(insumo.cantidad_utilizada))
            if insumo_lote.cantidad_restante == 0:
                insumo_lote.activo = False
            ids_afectados.add(insumo_lote.id)

    db.commit()

    for insumo_lote_id in ids_afectados:
        generar_notificacion_alerta_stock_individual(db, insumo_lote_id)

    db.expire_all()
    return listar_insumos_lote(db, lote_id)

def listar_historial_lote(db: Session, lote_id: int) -> list[HistorialEstadoLote]:
    return db.scalars(select(HistorialEstadoLote).where(HistorialEstadoLote.lote_id == lote_id).options(joinedload(HistorialEstadoLote.usuario))
        .order_by(HistorialEstadoLote.fecha_hora.asc())).all()


def obtener_trazabilidad_lote_produccion(db: Session, lote_id: int) -> schemas.TrazabilidadLoteProduccion:
    db_lote = db.scalar(
        select(LoteProduccion)
        .where(LoteProduccion.id == lote_id)
        .options(
            joinedload(LoteProduccion.producto),
            joinedload(LoteProduccion.receta),
            selectinload(LoteProduccion.insumos_utilizados)
            .joinedload(InsumoUtilizado.insumo_lote)
            .joinedload(InsumoLote.insumo)
            .joinedload(Insumo.unidad_medida),
            selectinload(LoteProduccion.insumos_utilizados)
            .joinedload(InsumoUtilizado.insumo_lote)
            .joinedload(InsumoLote.lote_proveedor)
            .joinedload(LoteProveedor.proveedor),
            selectinload(LoteProduccion.envios).joinedload(EnvioLote.cliente),
            selectinload(LoteProduccion.envios).joinedload(EnvioLote.direccion),
        )
    )
    if db_lote is None:
        raise exceptions.LoteProduccionNoEncontrado()

    origenes = []
    for insumo_utilizado in db_lote.insumos_utilizados:
        insumo_lote = insumo_utilizado.insumo_lote
        lote_proveedor = insumo_lote.lote_proveedor if insumo_lote else None
        proveedor = lote_proveedor.proveedor if lote_proveedor else None
        unidad_medida = "Unidades"
        if insumo_lote and insumo_lote.insumo and insumo_lote.insumo.unidad_medida:
            unidad_medida = insumo_lote.insumo.unidad_medida.nombre

        origenes.append(
            schemas.TrazabilidadOrigenInsumo(
                insumo_lote_id=insumo_lote.id,
                insumo_nombre=insumo_lote.insumo.nombre if insumo_lote.insumo else "Insumo",
                marca=insumo_lote.marca,
                numero_lote_insumo=insumo_lote.numero_lote,
                fecha_vencimiento=insumo_lote.fecha_vencimiento,
                cantidad_utilizada=insumo_utilizado.cantidad_utilizada,
                unidad_medida=unidad_medida,
                lote_proveedor_id=lote_proveedor.id if lote_proveedor else None,
                numero_remito=lote_proveedor.numero_remito if lote_proveedor else None,
                fecha_recepcion=lote_proveedor.fecha_recepcion if lote_proveedor else None,
                proveedor_id=proveedor.id if proveedor else None,
                proveedor_nombre=proveedor.nombre if proveedor else None,
                proveedor_cuit=proveedor.cuit if proveedor else None,
            )
        )

    destinos = []
    for envio in db_lote.envios:
        direccion_completa = ""
        if envio.direccion:
            direccion_completa = (
                f"{envio.direccion.calle_altura}, {envio.direccion.localidad} ({envio.direccion.provincia})"
            )
        destinos.append(
            schemas.TrazabilidadDestinoEnvio(
                envio_id=envio.id,
                numero_remito=envio.numero_remito,
                fecha_envio=envio.fecha_envio,
                fecha_entrega=envio.fecha_entrega,
                estado=envio.estado,
                cantidad=envio.cantidad,
                transportista=envio.transportista,
                cliente_id=envio.cliente_id,
                cliente_razon_social=envio.cliente.razon_social if envio.cliente else "Cliente",
                cliente_cuit=envio.cliente.cuit if envio.cliente else "",
                direccion=direccion_completa,
            )
        )

    return schemas.TrazabilidadLoteProduccion(
        lote_id=db_lote.id,
        producto_nombre=db_lote.producto.nombre if db_lote.producto else "Producto",
        fecha_produccion=db_lote.fecha_produccion,
        fecha_vencimiento=db_lote.fecha_vencimiento,
        cantidad_producida=db_lote.cantidad_producida,
        cantidad_disponible=db_lote.cantidad_disponible,
        estado=db_lote.estado,
        receta=db_lote.receta,
        origenes=origenes,
        destinos=destinos,
    )