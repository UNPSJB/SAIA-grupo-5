from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.notificaciones.models import Notificacion
from src.personal.models import Persona


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
