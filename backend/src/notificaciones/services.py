from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.configuracion_sistema.services import obtener_o_crear_configuracion
from src.elementosLimpieza.models import ElementoLimpieza
from src.elementosLimpieza.services import calcular_dias_restantes
from src.notificaciones.constants import TipoNotificacion
from src.notificaciones.models import Notificacion
from src.personal.models import Persona
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
