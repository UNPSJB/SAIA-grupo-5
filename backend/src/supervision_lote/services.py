from datetime import date, datetime
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from src.etapa_receta.models import EtapaReceta
from src.lote_produccion.models import EstadoLote, LoteProduccion
from src.personal.models import Persona
from src.producto.models import Producto
from src.receta.models import Receta
from src.supervision_lote import exceptions, schemas
from src.supervision_lote.constants import EstadoSupervisionOcurrencia
from src.supervision_lote.models import SupervisionOcurrencia


def _armar_cantidad_lote_snap(lote: LoteProduccion) -> str:
    if lote.producto and lote.producto.unidad_medida:
        return f"{lote.cantidad_producida} u. ({lote.producto.cantidad_neta} {lote.producto.unidad_medida.nombre})"
    if lote.producto:
        return f"{lote.cantidad_producida} u. ({lote.producto.cantidad_neta})"
    return f"{lote.cantidad_producida} u."


def generar_checklist_elaboracion_lote(db: Session, lote: LoteProduccion) -> list[SupervisionOcurrencia]:
    existentes = db.scalars(
        select(SupervisionOcurrencia).where(
            SupervisionOcurrencia.lote_produccion_id == lote.id,
            SupervisionOcurrencia.fase_lote_snap == EstadoLote.EN_PRODUCCION.value)).all()
    
    if existentes:
        return list(existentes)

    receta = db.scalar(select(Receta).where(Receta.producto_id == lote.producto_id,
                                        Receta.vigente == True)
                                        .options(joinedload(Receta.etapas)
                                        .joinedload(EtapaReceta.pasos)))
    
    if receta is None:
        return []

    producto = db.scalar(
        select(Producto)
        .where(Producto.id == lote.producto_id)
        .options(joinedload(Producto.unidad_medida))
    )
    producto_nombre = producto.nombre if producto else "Producto"
    cantidad_snap = (
        f"{lote.cantidad_producida} u. ({producto.cantidad_neta} {producto.unidad_medida.nombre})"
        if producto and producto.unidad_medida
        else f"{lote.cantidad_producida} u."
    )
    hoy = date.today()
    creadas: list[SupervisionOcurrencia] = []

    for etapa in receta.etapas:
        for paso in etapa.pasos:
            ocurrencia = SupervisionOcurrencia(
                lote_produccion_id=lote.id,
                fase_lote_snap=EstadoLote.EN_PRODUCCION.value,
                receta_id_origen=receta.id,
                receta_version_snap=receta.version,
                etapa_id_origen=etapa.id,
                etapa_nombre_snap=etapa.nombre,
                etapa_orden_snap=etapa.orden,
                paso_id_origen=paso.id,
                paso_descripcion_snap=paso.descripcion,
                paso_orden_snap=paso.orden,
                producto_nombre_snap=producto_nombre,
                cantidad_lote_snap=cantidad_snap,
                fecha=hoy,
                estado=EstadoSupervisionOcurrencia.PENDIENTE,
            )
            db.add(ocurrencia)
            creadas.append(ocurrencia)

    if not creadas:
        ocurrencia = SupervisionOcurrencia(
            lote_produccion_id=lote.id,
            fase_lote_snap=EstadoLote.EN_PRODUCCION.value,
            receta_id_origen=receta.id,
            receta_version_snap=receta.version,
            etapa_id_origen=None,
            etapa_nombre_snap="Elaboracion General",
            etapa_orden_snap=1,
            paso_id_origen=None,
            paso_descripcion_snap=f"Verificacion de elaboracion segun receta v{receta.version} de {producto_nombre}",
            paso_orden_snap=1,
            producto_nombre_snap=producto_nombre,
            cantidad_lote_snap=cantidad_snap,
            fecha=hoy,
            estado=EstadoSupervisionOcurrencia.PENDIENTE,
        )
        db.add(ocurrencia)
        creadas.append(ocurrencia)

    db.commit()
    for item in creadas:
        db.refresh(item)
    return creadas


def generar_checklist_empaquetado_lote(db: Session, lote: LoteProduccion) -> list[SupervisionOcurrencia]:
    existentes = db.scalars(
        select(SupervisionOcurrencia).where(
            SupervisionOcurrencia.lote_produccion_id == lote.id,
            SupervisionOcurrencia.fase_lote_snap == EstadoLote.EMPAQUETANDO.value)).all()
    
    if existentes:
        return list(existentes)

    receta = db.scalar(
        select(Receta).where(Receta.producto_id == lote.producto_id, Receta.vigente == True)
    )
    if receta is None:
        receta = db.scalar(
            select(Receta).where(Receta.producto_id == lote.producto_id).order_by(Receta.version.desc())
        )
    if receta is None:
        return []

    producto = db.scalar(select(Producto).where(Producto.id == lote.producto_id).options(joinedload(Producto.unidad_medida)))

    producto_nombre = producto.nombre if producto else "Producto"
    unidad_nombre = producto.unidad_medida.nombre if producto and producto.unidad_medida else "unidades"
    cantidad_neta = producto.cantidad_neta if producto else 1
    cantidad_snap = f"{lote.cantidad_producida} u. ({cantidad_neta} {unidad_nombre})"

    if receta.sellos.sellos:
        detalle_sellos = ", ".join(receta.sellos.sellos)
    else:
        detalle_sellos = "sin sellos de advertencia"

    fecha_elab_str = lote.fecha_produccion.strftime("%d/%m/%Y")
    fecha_venc_str = lote.fecha_vencimiento.strftime("%d/%m/%Y")

    pasos_empaquetado = [
        f"Verificacion de rotulado y sellos frontales en el envase ({detalle_sellos}).",
        f"Verificacion de impresion legible de Lote #{lote.id}, elaboracion ({fecha_elab_str}) y vencimiento ({fecha_venc_str}).",
        f"Control de integridad, cierre hermetico del envase y contenido neto ({cantidad_neta} {unidad_nombre} por unidad).",
        f"Conformidad de conteo final de unidades empaquetadas ({lote.cantidad_producida} unidades).",
    ]

    hoy = date.today()
    creadas: list[SupervisionOcurrencia] = []
    for idx, descripcion in enumerate(pasos_empaquetado, start=1):
        ocurrencia = SupervisionOcurrencia(
            lote_produccion_id=lote.id,
            fase_lote_snap=EstadoLote.EMPAQUETANDO.value,
            receta_id_origen=receta.id if receta else None,
            receta_version_snap=receta.version if receta else None,
            etapa_id_origen=None,
            etapa_nombre_snap="Control de Empaquetado y Rotulado",
            etapa_orden_snap=1,
            paso_id_origen=None,
            paso_descripcion_snap=descripcion,
            paso_orden_snap=idx,
            producto_nombre_snap=producto_nombre,
            cantidad_lote_snap=cantidad_snap,
            fecha=hoy,
            estado=EstadoSupervisionOcurrencia.PENDIENTE,
        )
        db.add(ocurrencia)
        creadas.append(ocurrencia)

    db.commit()
    for item in creadas:
        db.refresh(item)
    return creadas


def validar_checklist_fase_completo(db: Session, lote_id: int, fase_lote: str) -> None:
    ocurrencias_fase = db.scalars(
        select(SupervisionOcurrencia).where(
            SupervisionOcurrencia.lote_produccion_id == lote_id,
            SupervisionOcurrencia.fase_lote_snap == fase_lote)).all()
    
    for item in ocurrencias_fase:
        if item.estado == EstadoSupervisionOcurrencia.PENDIENTE:
            raise exceptions.ChecklistSupervisionIncompleto()


def listar_checklist_activo(db: Session, lote_id: int | None = None) -> list[SupervisionOcurrencia]:
    lotes_activos = db.scalars(select(LoteProduccion).where(LoteProduccion.activo == True)).all()
    
    for lote in lotes_activos:
        if lote.estado == EstadoLote.EN_PRODUCCION.value:
            generar_checklist_elaboracion_lote(db, lote)
        elif lote.estado == EstadoLote.EMPAQUETANDO.value:
            generar_checklist_empaquetado_lote(db, lote)

    consulta = (select(SupervisionOcurrencia).join(LoteProduccion, SupervisionOcurrencia.lote_produccion_id == LoteProduccion.id)
                .where(LoteProduccion.activo == True,SupervisionOcurrencia.fase_lote_snap == LoteProduccion.estado))
    
    if lote_id is not None:
        consulta = consulta.where(SupervisionOcurrencia.lote_produccion_id == lote_id)

    return list(
        db.scalars(
            consulta.order_by(
                SupervisionOcurrencia.lote_produccion_id.desc(),
                SupervisionOcurrencia.etapa_orden_snap.asc(),
                SupervisionOcurrencia.paso_orden_snap.asc(),
            )).all())


def listar_ocurrencias_por_lote(db: Session, lote_id: int) -> list[SupervisionOcurrencia]:
    lote = db.get(LoteProduccion, lote_id)
    if lote and lote.activo:
        if lote.estado == EstadoLote.EN_PRODUCCION.value:
            generar_checklist_elaboracion_lote(db, lote)
        elif lote.estado == EstadoLote.EMPAQUETANDO.value:
            generar_checklist_empaquetado_lote(db, lote)

    return list(
        db.scalars(
            select(SupervisionOcurrencia)
            .where(SupervisionOcurrencia.lote_produccion_id == lote_id)
            .order_by(
                SupervisionOcurrencia.id.asc(),
            )).all())


def leer_supervision_ocurrencia(db: Session, ocurrencia_id: int) -> SupervisionOcurrencia:
    db_ocurrencia = db.scalar(select(SupervisionOcurrencia).where(SupervisionOcurrencia.id == ocurrencia_id))

    if db_ocurrencia is None:
        raise exceptions.SupervisionOcurrenciaNoEncontrada()
    return db_ocurrencia


def completar_supervision_ocurrencia(db: Session, ocurrencia_id: int, datos: schemas.SupervisionOcurrenciaCompletar, supervisor: Persona) -> SupervisionOcurrencia:
    db_ocurrencia = leer_supervision_ocurrencia(db, ocurrencia_id)
    es_edicion = db_ocurrencia.estado == EstadoSupervisionOcurrencia.COMPLETADA

    if es_edicion and db_ocurrencia.supervisor_id != supervisor.id:
        raise exceptions.SupervisionCompletadaPorOtro()

    if not es_edicion:
        pendientes_fase = db.scalars(
            select(SupervisionOcurrencia).where(
                SupervisionOcurrencia.lote_produccion_id == db_ocurrencia.lote_produccion_id,
                SupervisionOcurrencia.fase_lote_snap == db_ocurrencia.fase_lote_snap,
                SupervisionOcurrencia.estado == EstadoSupervisionOcurrencia.PENDIENTE)).all()
        
        orden_actual = (db_ocurrencia.etapa_orden_snap, db_ocurrencia.paso_orden_snap)
        for item in pendientes_fase:
            if (item.etapa_orden_snap, item.paso_orden_snap) < orden_actual:
                raise exceptions.PasoSupervisionPrevioIncompleto()

    db_ocurrencia.supervisor_id = supervisor.id
    db_ocurrencia.estado = EstadoSupervisionOcurrencia.COMPLETADA
    db_ocurrencia.observacion = datos.observacion.strip() if datos.observacion else None

    if es_edicion:
        db_ocurrencia.fue_editada = True
        db_ocurrencia.fecha_edicion = datetime.now()
        if not db_ocurrencia.fecha_completado:
            db_ocurrencia.fecha_completado = datetime.now()
    else:
        db_ocurrencia.fecha_completado = datetime.now()

    db.commit()
    db.refresh(db_ocurrencia)
    return db_ocurrencia


def listar_historial_supervision(db: Session, fecha_desde: date, fecha_hasta: date, supervisor_id: int | None = None) -> list[SupervisionOcurrencia]:
    consulta = select(SupervisionOcurrencia).where(
        SupervisionOcurrencia.fecha >= fecha_desde,
        SupervisionOcurrencia.fecha <= fecha_hasta)
    
    if supervisor_id is not None:
        consulta = consulta.where(SupervisionOcurrencia.supervisor_id == supervisor_id)

    return list(
        db.scalars(consulta.order_by(
                SupervisionOcurrencia.fecha.desc(),
                SupervisionOcurrencia.id.desc())).all())
