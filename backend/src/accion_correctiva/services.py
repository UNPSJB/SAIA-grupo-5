import logging
from datetime import datetime
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from src.accion_correctiva.models import AccionCorrectiva
from src.accion_correctiva import exceptions, schemas
from src.incidentes.models import Incidente
from src.incidentes import exceptions as incidente_exceptions
from src.incidentes.constants import EstadoIncidente
from src.historial_incidente import services as historial_services
from src.historial_incidente.constants import TipoEvento

logger = logging.getLogger(__name__)


def crear_accion_correctiva(db: Session, accion_correctiva: schemas.AccionCorrectivaCreate, persona) -> schemas.AccionCorrectiva:
    db_incidente = db.scalar(select(Incidente).where(Incidente.id == accion_correctiva.incidente_id))
    if db_incidente is None:
        raise incidente_exceptions.IncidenteNoEncontrado()

    datos = accion_correctiva.model_dump()
    datos["persona_id"] = persona.id
    datos["fecha"] = datetime.now()

    _accion_correctiva = AccionCorrectiva(**datos)
    db.add(_accion_correctiva)
    db.flush()  # necesitamos el id de la accion correctiva para el evento de historial

    db_incidente.estado = EstadoIncidente.CERRADO

    historial_services.registrar_evento_historial(
        db,
        incidente_id=db_incidente.id,
        tipo_evento=TipoEvento.CERRADO,
        usuario_id=persona.id,
        accion_correctiva_id=_accion_correctiva.id,
    )

    db.commit()
    db.refresh(_accion_correctiva)
    return _accion_correctiva


def leer_accion_correctiva(db: Session, accion_correctiva_id: int) -> schemas.AccionCorrectiva:
    db_accion_correctiva = db.scalar(
        select(AccionCorrectiva)
        .where(AccionCorrectiva.id == accion_correctiva_id)
        .options(joinedload(AccionCorrectiva.persona))
    )
    if db_accion_correctiva is None:
        raise exceptions.AccionCorrectivaNoEncontrada()
    return db_accion_correctiva


def modificar_accion_correctiva(db: Session, accion_correctiva_id: int, accion_correctiva: schemas.AccionCorrectivaUpdate) -> schemas.AccionCorrectiva:
    db_accion_correctiva = leer_accion_correctiva(db, accion_correctiva_id)
    db_accion_correctiva.descripcion = accion_correctiva.descripcion
    db.commit()
    db.refresh(db_accion_correctiva)
    return db_accion_correctiva


def cambiar_estado_accion_correctiva(db: Session, accion_correctiva_id: int) -> schemas.AccionCorrectiva:
    db_accion_correctiva = leer_accion_correctiva(db, accion_correctiva_id)
    db_accion_correctiva.activo = not db_accion_correctiva.activo
    db.commit()
    db.refresh(db_accion_correctiva)
    return db_accion_correctiva


def listar_acciones_correctivas(db: Session) -> List[schemas.AccionCorrectiva]:
    return db.scalars(select(AccionCorrectiva).options(joinedload(AccionCorrectiva.persona))).all()


def listar_acciones_correctivas_por_incidente(db: Session, incidente_id: int) -> List[schemas.AccionCorrectiva]:
    db_incidente = db.scalar(select(Incidente).where(Incidente.id == incidente_id))
    if db_incidente is None:
        raise incidente_exceptions.IncidenteNoEncontrado()

    return db.scalars(
        select(AccionCorrectiva)
        .where(AccionCorrectiva.incidente_id == incidente_id)
        .options(joinedload(AccionCorrectiva.persona))
    ).all()
