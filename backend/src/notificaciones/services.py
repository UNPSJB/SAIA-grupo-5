from datetime import date, datetime, timedelta
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from src.configuracion_sistema.services import obtener_o_crear_configuracion
from src.elementosLimpieza.models import ElementoLimpieza
from src.elementosLimpieza.services import calcular_dias_restantes
from src.equipos.models import Equipo
from src.insumos_lote.models import InsumoLote
from src.insumos_lote.services import listar_todos_los_insumos_lote
from src.notificaciones.constants import TipoNotificacion
from src.notificaciones.models import Notificacion
from src.pedidos_proveedor.constants import EstadoPedidoProveedor
from src.pedidos_proveedor.models import PedidoProveedor
from src.personal.models import Persona
from src.planesCalibracion.constants import DIAS_ALERTA_CALIBRACION
from src.planesCalibracion.models import PlanCalibracion
from src.planesCalibracion.services import calcular_dias_restantes as calcular_dias_restantes_calibracion
from src.proveedor.models import Proveedor
from src.vencimiento_personal.models import VencimientoPersonal


def crear_para_administradores(db: Session, datos: dict) -> list[Notificacion]:
    administradores = db.scalars(
        select(Persona).where(Persona.administrar.is_(True), Persona.activo.is_(True))
    ).all()
    clave_origen = f"manual:{uuid4()}"
    notificaciones = [
        Notificacion(
            administrador_id=administrador.id,
            clave_origen=clave_origen,
            tipo=datos["tipo"],
            entidad_id=datos.get("entidad_id"),
            entidad=datos["entidad"],
            titulo=datos["titulo"],
            descripcion=datos["descripcion"],
            url=datos.get("url"),
            leida=False,
            resuelta=False,
        )
        for administrador in administradores
    ]

    if notificaciones:
        db.add_all(notificaciones)
        db.commit()
        for notificacion in notificaciones:
            db.refresh(notificacion)

    return notificaciones


def _listar_administradores(db: Session) -> list[Persona]:
    return db.scalars(
        select(Persona).where(Persona.administrar.is_(True), Persona.activo.is_(True))
    ).all()


#################### Recambio de elementos de limpieza ####################

def _notificacion_recambio_elemento_si_corresponde(
    db: Session, elemento: ElementoLimpieza, hoy: date, administradores: list[Persona]
) -> list[Notificacion]:
    
    dias_restantes = calcular_dias_restantes(db, elemento)
    if dias_restantes is None or dias_restantes > 0:
        return []

    if dias_restantes == 0:
        titulo = f"Recambio vence hoy: {elemento.nombre}"
        descripcion = f"El elemento {elemento.codigo} - {elemento.nombre} vence hoy y requiere recambio."
        url = "/elementos-limpieza?estado=por-vencer"
    else:
        dias_vencido = abs(dias_restantes)
        dia_o_dias = "día" if dias_vencido == 1 else "días"
        titulo = f"Recambio vencido hace {dias_vencido} {dia_o_dias}: {elemento.nombre}"
        descripcion = f"El elemento {elemento.codigo} - {elemento.nombre} está vencido hace {dias_vencido} {dia_o_dias} y requiere recambio urgente."
        url = "/elementos-limpieza?estado=vencido"

    clave_origen = f"recambio_elemento:{elemento.id}:{hoy.isoformat()}"

    creadas: list[Notificacion] = []
    for administrador in administradores:
        ya_existe = db.scalar(
            select(Notificacion).where(
                Notificacion.administrador_id == administrador.id,
                Notificacion.clave_origen == clave_origen,
            )
        )
        if ya_existe:
            continue

        creadas.append(
            Notificacion(
                administrador_id=administrador.id,
                clave_origen=clave_origen,
                tipo=TipoNotificacion.RECAMBIO_ELEMENTO.value,
                entidad_id=elemento.id,
                entidad="ElementoLimpieza",
                titulo=titulo,
                descripcion=descripcion,
                url=url,
                leida=False,
                resuelta=False,
            )
        )

    return creadas


def generar_notificaciones_recambio_elementos(db: Session) -> list[Notificacion]:
    # Chequeo diario
    
    hoy = date.today()
    elementos_activos = db.scalars(
        select(ElementoLimpieza).where(ElementoLimpieza.estado.is_(True))
    ).all()
    administradores = _listar_administradores(db)

    creadas: list[Notificacion] = []
    for elemento in elementos_activos:
        creadas.extend(_notificacion_recambio_elemento_si_corresponde(db, elemento, hoy, administradores))

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)

    return creadas


def generar_notificacion_recambio_elemento_individual(db: Session, elemento_id: int) -> list[Notificacion]:
    # Chequeo puntual de un único elemento
    
    elemento = db.get(ElementoLimpieza, elemento_id)
    if elemento is None or not elemento.estado:
        return []

    hoy = date.today()
    administradores = _listar_administradores(db)
    creadas = _notificacion_recambio_elemento_si_corresponde(db, elemento, hoy, administradores)

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)

    return creadas


def resolver_notificaciones_recambio_elemento(db: Session, elemento_id: int) -> int:
    # Marca como resueltas las notificaciones 
    
    pendientes = db.scalars(
        select(Notificacion).where(
            Notificacion.tipo == TipoNotificacion.RECAMBIO_ELEMENTO.value,
            Notificacion.entidad_id == elemento_id,
            Notificacion.resuelta.is_(False),
        )
    ).all()

    for notificacion in pendientes:
        notificacion.resuelta = True
        notificacion.resuelta_en = datetime.now()

    if pendientes:
        db.commit()

    return len(pendientes)



#################### Vencimiento de personal ##############################


def _notificacion_vencimiento_personal_si_corresponde(
    db: Session,
    vencimiento: VencimientoPersonal,
    hoy: date,
    dias_antelacion: int,
    administradores: list[Persona],
) -> list[Notificacion]:
    # Evalúa un único vencimiento de personal
    
    dias_restantes = vencimiento.dias_restantes
    if dias_restantes > dias_antelacion:
        return []

    persona_nombre = f"{vencimiento.persona.nombre} {vencimiento.persona.apellido or ''}".strip()
    tipo_nombre = vencimiento.tipo_vencimiento.nombre

    if dias_restantes < 0:
        dias_vencido = abs(dias_restantes)
        dia_o_dias = "día" if dias_vencido == 1 else "días"
        titulo = f"Vencimiento vencido hace {dias_vencido} {dia_o_dias}: {tipo_nombre} de {persona_nombre}"
        descripcion = f"El vencimiento de {tipo_nombre} de {persona_nombre} está vencido hace {dias_vencido} {dia_o_dias}."
    elif dias_restantes == 0:
        titulo = f"Vencimiento hoy: {tipo_nombre} de {persona_nombre}"
        descripcion = f"El vencimiento de {tipo_nombre} de {persona_nombre} vence hoy."
    else:
        dia_o_dias = "día" if dias_restantes == 1 else "días"
        titulo = f"Vencimiento en {dias_restantes} {dia_o_dias}: {tipo_nombre} de {persona_nombre}"
        descripcion = f"El vencimiento de {tipo_nombre} de {persona_nombre} vence en {dias_restantes} {dia_o_dias}."

    clave_origen = f"vencimiento_personal:{vencimiento.id}:{hoy.isoformat()}"

    creadas: list[Notificacion] = []
    for administrador in administradores:
        ya_existe = db.scalar(
            select(Notificacion).where(
                Notificacion.administrador_id == administrador.id,
                Notificacion.clave_origen == clave_origen,
            )
        )
        if ya_existe:
            continue

        creadas.append(
            Notificacion(
                administrador_id=administrador.id,
                clave_origen=clave_origen,
                tipo=TipoNotificacion.VENCIMIENTO_PERSONAL.value,
                entidad_id=vencimiento.id,
                entidad="VencimientoPersonal",
                titulo=titulo,
                descripcion=descripcion,
                url=f"/personal/{vencimiento.persona_id}/vencimientos",
                leida=False,
                resuelta=False,
            )
        )

    return creadas


def generar_notificaciones_vencimiento_personal(db: Session) -> list[Notificacion]:
    # Chequeo diario, recorre todos los vencimientos de personal
    
    hoy = date.today()
    dias_antelacion = obtener_o_crear_configuracion(db).dias_antelacion_vencimiento
    vencimientos_actuales = db.scalars(
        select(VencimientoPersonal).where(VencimientoPersonal.es_actual.is_(True))
    ).all()
    administradores = _listar_administradores(db)

    creadas: list[Notificacion] = []
    for vencimiento in vencimientos_actuales:
        creadas.extend(
            _notificacion_vencimiento_personal_si_corresponde(db, vencimiento, hoy, dias_antelacion, administradores)
        )

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)

    return creadas


def generar_notificacion_vencimiento_personal_individual(db: Session, vencimiento_id: int) -> list[Notificacion]:
    # Chequeo puntual de un único vencimiento
    
    vencimiento = db.get(VencimientoPersonal, vencimiento_id)
    if vencimiento is None or not vencimiento.es_actual:
        return []

    hoy = date.today()
    dias_antelacion = obtener_o_crear_configuracion(db).dias_antelacion_vencimiento
    administradores = _listar_administradores(db)
    creadas = _notificacion_vencimiento_personal_si_corresponde(db, vencimiento, hoy, dias_antelacion, administradores)

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)

    return creadas


def resolver_notificaciones_vencimiento_personal(db: Session, vencimiento_id: int) -> int:
    # Marca como resueltas las notificaciones pendientes de un vencimiento 
    
    pendientes = db.scalars(
        select(Notificacion).where(
            Notificacion.tipo == TipoNotificacion.VENCIMIENTO_PERSONAL.value,
            Notificacion.entidad_id == vencimiento_id,
            Notificacion.resuelta.is_(False),
        )
    ).all()

    for notificacion in pendientes:
        notificacion.resuelta = True
        notificacion.resuelta_en = datetime.now()

    if pendientes:
        db.commit()

    return len(pendientes)


#################### Calibración de equipos ###############################


def _notificacion_calibracion_equipo_si_corresponde(
    db: Session, plan: PlanCalibracion, hoy: date, administradores: list[Persona]
) -> list[Notificacion]:

    dias_restantes = calcular_dias_restantes_calibracion(db, plan)
    if dias_restantes > DIAS_ALERTA_CALIBRACION:
        return []

    equipo_nombre = plan.equipo.nombre

    if dias_restantes < 0:
        dias_vencido = abs(dias_restantes)
        dia_o_dias = "día" if dias_vencido == 1 else "días"
        titulo = f"Calibración vencida hace {dias_vencido} {dia_o_dias}: {equipo_nombre}"
        descripcion = f"La calibración del equipo {equipo_nombre} está vencida hace {dias_vencido} {dia_o_dias}."
    elif dias_restantes == 0:
        titulo = f"Calibración vence hoy: {equipo_nombre}"
        descripcion = f"La calibración del equipo {equipo_nombre} vence hoy."
    else:
        dia_o_dias = "día" if dias_restantes == 1 else "días"
        titulo = f"Calibración vence en {dias_restantes} {dia_o_dias}: {equipo_nombre}"
        descripcion = f"La calibración del equipo {equipo_nombre} vence en {dias_restantes} {dia_o_dias}."

    clave_origen = f"calibracion_equipo:{plan.id}:{hoy.isoformat()}"

    creadas: list[Notificacion] = []
    for administrador in administradores:
        ya_existe = db.scalar(
            select(Notificacion).where(
                Notificacion.administrador_id == administrador.id,
                Notificacion.clave_origen == clave_origen,
            )
        )
        if ya_existe:
            continue

        creadas.append(
            Notificacion(
                administrador_id=administrador.id,
                clave_origen=clave_origen,
                tipo=TipoNotificacion.CALIBRACION_EQUIPO.value,
                entidad_id=plan.id,
                entidad="PlanCalibracion",
                titulo=titulo,
                descripcion=descripcion,
                url="/planes-calibracion",
                leida=False,
                resuelta=False,
            )
        )

    return creadas


def generar_notificaciones_calibracion_equipos(db: Session) -> list[Notificacion]:
    # Chequeo diario

    hoy = date.today()
    planes_activos = db.scalars(
        select(PlanCalibracion)
        .join(PlanCalibracion.equipo)
        .where(PlanCalibracion.estado.is_(True), Equipo.estado.is_(True))
    ).all()
    administradores = _listar_administradores(db)

    creadas: list[Notificacion] = []
    for plan in planes_activos:
        creadas.extend(_notificacion_calibracion_equipo_si_corresponde(db, plan, hoy, administradores))

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)

    return creadas


def generar_notificacion_calibracion_equipo_individual(db: Session, plan_id: int) -> list[Notificacion]:
    # Chequeo puntual 

    plan = db.get(PlanCalibracion, plan_id)
    if plan is None or not plan.estado or not plan.equipo.estado:
        return []

    hoy = date.today()
    administradores = _listar_administradores(db)
    creadas = _notificacion_calibracion_equipo_si_corresponde(db, plan, hoy, administradores)

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)

    return creadas


def resolver_notificaciones_calibracion_equipo(db: Session, plan_id: int) -> int:

    pendientes = db.scalars(
        select(Notificacion).where(
            Notificacion.tipo == TipoNotificacion.CALIBRACION_EQUIPO.value,
            Notificacion.entidad_id == plan_id,
            Notificacion.resuelta.is_(False),
        )
    ).all()

    for notificacion in pendientes:
        notificacion.resuelta = True
        notificacion.resuelta_en = datetime.now()

    if pendientes:
        db.commit()

    return len(pendientes)


#################### Alerta mínima de stock ###############################


def notificacion_alerta_stock_si_corresponde(
    db: Session, insumo_lote: InsumoLote, hoy: date, administradores: list[Persona]
) -> list[Notificacion]:

    if insumo_lote.minimo_alerta is None or insumo_lote.cantidad_restante >= insumo_lote.minimo_alerta:
        return []

    insumo_nombre = insumo_lote.insumo.nombre
    unidad = insumo_lote.insumo.unidad_medida.nombre if insumo_lote.insumo.unidad_medida else ""
    restante = f"{insumo_lote.cantidad_restante} {unidad}".strip()
    minimo = f"{insumo_lote.minimo_alerta} {unidad}".strip()

    titulo = f"Stock bajo: {insumo_nombre} (lote {insumo_lote.numero_lote})"
    descripcion = (
        f"Al insumo {insumo_nombre} del lote {insumo_lote.numero_lote} le quedan {restante}, "
        f"por debajo del mínimo de alerta de {minimo}."
    )

    clave_origen = f"alerta_stock:{insumo_lote.id}:{hoy.isoformat()}"

    creadas: list[Notificacion] = []
    for administrador in administradores:
        ya_existe = db.scalar(
            select(Notificacion).where(
                Notificacion.administrador_id == administrador.id,
                Notificacion.clave_origen == clave_origen,
            )
        )
        if ya_existe:
            continue

        creadas.append(
            Notificacion(
                administrador_id=administrador.id,
                clave_origen=clave_origen,
                tipo=TipoNotificacion.ALERTA_STOCK.value,
                entidad_id=insumo_lote.id,
                entidad="InsumoLote",
                titulo=titulo,
                descripcion=descripcion,
                url=f"/insumos-lote/{insumo_lote.id}",
                leida=False,
                resuelta=False,
            )
        )

    return creadas


def generar_notificaciones_alerta_stock(db: Session) -> list[Notificacion]:

    hoy = date.today()
    insumos_lote = [
        insumo_lote for insumo_lote in listar_todos_los_insumos_lote(db) if insumo_lote.activo
    ]
    administradores = _listar_administradores(db)

    creadas: list[Notificacion] = []
    for insumo_lote in insumos_lote:
        creadas.extend(notificacion_alerta_stock_si_corresponde(db, insumo_lote, hoy, administradores))

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)

    return creadas


def generar_notificacion_alerta_stock_individual(db: Session, insumo_lote_id: int) -> list[Notificacion]:

    insumo_lote = db.get(InsumoLote, insumo_lote_id)
    if insumo_lote is None or not insumo_lote.activo:
        return []

    hoy = date.today()
    administradores = _listar_administradores(db)
    creadas = notificacion_alerta_stock_si_corresponde(db, insumo_lote, hoy, administradores)

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)

    return creadas


#################### Vencimiento de insumos lote #######################


def _crear_notificaciones_si_no_existen(db: Session, administradores: list[Persona], clave_origen: str, tipo: str, entidad_id: int, entidad: str, titulo: str, descripcion: str, url: str,) -> list[Notificacion]:
    creadas: list[Notificacion] = []
    for administrador in administradores:
        ya_existe = db.scalar(
            select(Notificacion).where(
                Notificacion.administrador_id == administrador.id,
                Notificacion.clave_origen == clave_origen,
            )
        )
        if ya_existe:
            continue
        creadas.append(
            Notificacion(
                administrador_id=administrador.id,
                clave_origen=clave_origen,
                tipo=tipo,
                entidad_id=entidad_id,
                entidad=entidad,
                titulo=titulo,
                descripcion=descripcion,
                url=url,
                leida=False,
                resuelta=False,
            )
        )
    return creadas


def generar_notificaciones_vencimiento_insumo_lote(db: Session) -> list[Notificacion]:
    hoy = date.today()
    fecha_limite = hoy + timedelta(days=15)
    insumos_lote = [
        insumo_lote for insumo_lote in listar_todos_los_insumos_lote(db)
        if insumo_lote.activo and insumo_lote.cantidad_restante > 0 and insumo_lote.fecha_vencimiento <= fecha_limite
    ]
    administradores = _listar_administradores(db)

    creadas: list[Notificacion] = []
    for insumo_lote in insumos_lote:
        dias_restantes = (insumo_lote.fecha_vencimiento - hoy).days
        insumo_nombre = insumo_lote.insumo.nombre if insumo_lote.insumo else "Insumo"
        if dias_restantes <= 0:
            titulo = f"Insumo vencido: {insumo_nombre} (lote {insumo_lote.numero_lote})"
            descripcion = (
                f"El insumo {insumo_nombre} marca {insumo_lote.marca} (lote {insumo_lote.numero_lote}) "
                f"vencio el {insumo_lote.fecha_vencimiento.strftime('%d/%m/%Y')} y aun tiene {insumo_lote.cantidad_restante} en stock."
            )
        else:
            titulo = f"Insumo proximo a vencer: {insumo_nombre} ({dias_restantes} dias)"
            descripcion = (
                f"El insumo {insumo_nombre} marca {insumo_lote.marca} (lote {insumo_lote.numero_lote}) "
                f"vence en {dias_restantes} dias ({insumo_lote.fecha_vencimiento.strftime('%d/%m/%Y')}) y queda bloqueado para produccion."
            )

        creadas.extend(
            _crear_notificaciones_si_no_existen(
                db=db,
                administradores=administradores,
                clave_origen=f"vencimiento_insumo_lote:{insumo_lote.id}:{hoy.isoformat()}",
                tipo=TipoNotificacion.VENCIMIENTO_INSUMO_LOTE.value,
                entidad_id=insumo_lote.id,
                entidad="InsumoLote",
                titulo=titulo,
                descripcion=descripcion,
                url=f"/insumos-lote/{insumo_lote.id}",
            )
        )

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)
    return creadas


#################### Habilitacion sanitaria de proveedores ################


def generar_notificaciones_habilitacion_proveedor(db: Session) -> list[Notificacion]:
    hoy = date.today()
    fecha_limite = hoy + timedelta(days=30)
    proveedores = db.scalars(
        select(Proveedor).where(
            Proveedor.activo.is_(True),
            Proveedor.vencimiento_habilitacion.is_not(None),
            Proveedor.vencimiento_habilitacion <= fecha_limite,
        )
    ).all()
    administradores = _listar_administradores(db)

    creadas: list[Notificacion] = []
    for proveedor in proveedores:
        dias_restantes = (proveedor.vencimiento_habilitacion - hoy).days
        if dias_restantes < 0:
            titulo = f"Habilitacion vencida: {proveedor.nombre}"
            descripcion = (
                f"La habilitacion sanitaria del proveedor {proveedor.nombre} vencio hace {abs(dias_restantes)} dias "
                f"({proveedor.vencimiento_habilitacion.strftime('%d/%m/%Y')}). No podra recibir nuevos pedidos."
            )
        else:
            titulo = f"Habilitacion por vencer: {proveedor.nombre} ({dias_restantes} dias)"
            descripcion = (
                f"La habilitacion sanitaria del proveedor {proveedor.nombre} vence en {dias_restantes} dias "
                f"({proveedor.vencimiento_habilitacion.strftime('%d/%m/%Y')})."
            )

        creadas.extend(
            _crear_notificaciones_si_no_existen(
                db=db,
                administradores=administradores,
                clave_origen=f"habilitacion_proveedor:{proveedor.id}:{hoy.isoformat()}",
                tipo=TipoNotificacion.HABILITACION_PROVEEDOR.value,
                entidad_id=proveedor.id,
                entidad="Proveedor",
                titulo=titulo,
                descripcion=descripcion,
                url=f"/proveedores/{proveedor.id}",
            )
        )

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)
    return creadas


#################### Pedidos a proveedor demorados #######################


def generar_notificaciones_pedidos_demorados(db: Session) -> list[Notificacion]:
    hoy = date.today()
    pedidos = db.scalars(
        select(PedidoProveedor)
        .options(joinedload(PedidoProveedor.proveedor))
        .where(
            PedidoProveedor.activo.is_(True),
            PedidoProveedor.estado == EstadoPedidoProveedor.PENDIENTE,
            PedidoProveedor.fecha_entrega_estimada.is_not(None),
            PedidoProveedor.fecha_entrega_estimada <= hoy,
        )
    ).all()
    administradores = _listar_administradores(db)

    creadas: list[Notificacion] = []
    for pedido in pedidos:
        dias_demora = (hoy - pedido.fecha_entrega_estimada).days
        proveedor_nombre = pedido.proveedor.nombre if pedido.proveedor else "Proveedor"
        if dias_demora == 0:
            titulo = f"Pedido #{pedido.id} con entrega estimada hoy ({proveedor_nombre})"
            descripcion = f"El pedido #{pedido.id} al proveedor {proveedor_nombre} tiene entrega estimada para hoy y sigue pendiente."
        else:
            titulo = f"Pedido demorado #{pedido.id} ({proveedor_nombre})"
            descripcion = (
                f"El pedido #{pedido.id} al proveedor {proveedor_nombre} lleva {dias_demora} dias de demora "
                f"respecto a su fecha estimada ({pedido.fecha_entrega_estimada.strftime('%d/%m/%Y')})."
            )

        creadas.extend(
            _crear_notificaciones_si_no_existen(
                db=db,
                administradores=administradores,
                clave_origen=f"pedido_proveedor_demorado:{pedido.id}:{hoy.isoformat()}",
                tipo=TipoNotificacion.PEDIDO_PROVEEDOR_DEMORADO.value,
                entidad_id=pedido.id,
                entidad="PedidoProveedor",
                titulo=titulo,
                descripcion=descripcion,
                url=f"/pedidos-proveedor/{pedido.id}",
            )
        )

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)
    return creadas


#################### Incidentes vinculados a lotes #####################


def generar_notificacion_incidente_lote(db: Session, incidente) -> list[Notificacion]:
    if incidente.lote_produccion_id is None and incidente.lote_proveedor_id is None:
        return []

    administradores = _listar_administradores(db)
    creadas: list[Notificacion] = []

    if incidente.lote_produccion_id is not None:
        creadas.extend(
            _crear_notificaciones_si_no_existen(
                db=db,
                administradores=administradores,
                clave_origen=f"incidente_lote_produccion:{incidente.id}",
                tipo=TipoNotificacion.INCIDENTE_LOTE_PRODUCCION.value,
                entidad_id=incidente.lote_produccion_id,
                entidad="LoteProduccion",
                titulo=f"Incidente en Lote de Produccion #{incidente.lote_produccion_id}: {incidente.nombre}",
                descripcion=incidente.descripcion,
                url=f"/incidentes/{incidente.id}",
            )
        )

    if incidente.lote_proveedor_id is not None:
        creadas.extend(
            _crear_notificaciones_si_no_existen(
                db=db,
                administradores=administradores,
                clave_origen=f"incidente_lote_proveedor:{incidente.id}",
                tipo=TipoNotificacion.INCIDENTE_LOTE_PROVEEDOR.value,
                entidad_id=incidente.lote_proveedor_id,
                entidad="LoteProveedor",
                titulo=f"Incidente en Recepcion de Proveedor #{incidente.lote_proveedor_id}: {incidente.nombre}",
                descripcion=incidente.descripcion,
                url=f"/incidentes/{incidente.id}",
            )
        )

    if creadas:
        db.add_all(creadas)
        db.commit()
        for notificacion in creadas:
            db.refresh(notificacion)
    return creadas


#################### utiles ###############################################


def listar_notificaciones(db: Session, administrador_id: int) -> list[Notificacion]:
    return db.scalars(
        select(Notificacion)
        .where(Notificacion.administrador_id == administrador_id)
        .order_by(Notificacion.creada_en.desc(), Notificacion.id.desc())
    ).all()


def marcar_como_leida(
    db: Session,
    administrador_id: int,
    notificacion_id: int,
) -> Notificacion | None:
    notificacion = db.scalar(
        select(Notificacion).where(
            Notificacion.id == notificacion_id,
            Notificacion.administrador_id == administrador_id,
        )
    )
    if notificacion is None:
        return None

    notificacion.leida = True
    db.commit()
    db.refresh(notificacion)
    return notificacion
