import logging
from datetime import date
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.vencimiento_personal.models import VencimientoPersonal
from src.vencimiento_personal import schemas, exceptions
from src.tipos_vencimientos import services as tipos_vencimientos_services
from src.personal.models import Persona
from src.personal import exceptions as personal_exceptions

logger = logging.getLogger(__name__)


def validar_rango_fechas(fecha_desde: date, fecha_hasta: date):
    if fecha_hasta < fecha_desde:
        raise exceptions.FechasVencimientoInvalidas()


def leer_vencimiento_personal(db: Session, vencimiento_id: int) -> schemas.VencimientoPersonal:
    db_vencimiento = db.scalars(select(VencimientoPersonal).where
                        (VencimientoPersonal.id == vencimiento_id)).first()

    if db_vencimiento is None:
        raise exceptions.VencimientoNoEncontrado()
    return db_vencimiento


def listar_vencimientos_actuales_persona(db: Session, persona_id: int) -> List[schemas.VencimientoPersonal]:
    db_persona = db.scalars(select(Persona).where(Persona.id == persona_id)).first()
    if db_persona is None:
        raise personal_exceptions.PersonaNoEncontrada()

    return db.scalars(select(VencimientoPersonal).where(
            VencimientoPersonal.persona_id == persona_id,
            VencimientoPersonal.es_actual == True)).all()


def listar_historico_persona(db: Session, persona_id: int, tipo_vencimiento_id: int) -> List[schemas.VencimientoPersonal]:
    return db.scalars(select(VencimientoPersonal).where(
            VencimientoPersonal.persona_id == persona_id,
            VencimientoPersonal.tipo_vencimiento_id == tipo_vencimiento_id,)
        .order_by(VencimientoPersonal.fecha_carga.desc())).all()


def crear_vencimiento(db: Session, vencimiento: schemas.VencimientoPersonalCreate) -> schemas.VencimientoPersonal:
    validar_rango_fechas(vencimiento.fecha_desde, vencimiento.fecha_hasta)

    db_persona = db.scalars(select(Persona).where(Persona.id == vencimiento.persona_id)).first()
    if db_persona is None:
        raise personal_exceptions.PersonaNoEncontrada()

    db_tipo_vencimiento = tipos_vencimientos_services.leer_tipo_vencimiento(db, vencimiento.tipo_vencimiento_id)
    if not db_tipo_vencimiento.activo:
        raise exceptions.TipoVencimientoInactivo()

    vencimiento_existente = db.scalars(select(VencimientoPersonal).where(
            VencimientoPersonal.persona_id == vencimiento.persona_id,
            VencimientoPersonal.tipo_vencimiento_id == vencimiento.tipo_vencimiento_id,
            VencimientoPersonal.es_actual == True)).first()

    if vencimiento_existente:
        raise exceptions.VencimientoDuplicado()

    _vencimiento = VencimientoPersonal(**vencimiento.model_dump())
    _vencimiento.es_actual = True
    db.add(_vencimiento)
    db.commit()
    db.refresh(_vencimiento)
    return _vencimiento


def renovar_vencimiento(db: Session, vencimiento_id: int, vencimiento: schemas.VencimientoPersonalUpdate) -> schemas.VencimientoPersonal:
    validar_rango_fechas(vencimiento.fecha_desde, vencimiento.fecha_hasta)

    db_vencimiento_anterior = leer_vencimiento_personal(db, vencimiento_id)
    db_vencimiento_anterior.es_actual = False

    _vencimiento = VencimientoPersonal(
        persona_id=db_vencimiento_anterior.persona_id,
        tipo_vencimiento_id=db_vencimiento_anterior.tipo_vencimiento_id,
        **vencimiento.model_dump(),
        es_actual=True)
    
    db.add(_vencimiento)
    db.commit()
    db.refresh(_vencimiento)
    return _vencimiento


def modificar_vencimiento(db: Session, vencimiento_id: int, vencimiento: schemas.VencimientoPersonalUpdate) -> schemas.VencimientoPersonal:
    validar_rango_fechas(vencimiento.fecha_desde, vencimiento.fecha_hasta)

    db_vencimiento = leer_vencimiento_personal(db, vencimiento_id)

    for key, value in vencimiento.model_dump().items():
        setattr(db_vencimiento, key, value)

    db.commit()
    db.refresh(db_vencimiento)
    return db_vencimiento

def listar_vencimientos_personal(db: Session) -> List[schemas.VencimientoPersonal]:
    return db.scalars(select(VencimientoPersonal).where(VencimientoPersonal.es_actual == True)
                        .order_by(VencimientoPersonal.fecha_hasta.asc())).all()