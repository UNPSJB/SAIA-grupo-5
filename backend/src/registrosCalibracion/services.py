import logging
from datetime import date
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.registrosCalibracion.models import RegistroCalibracion
from src.registrosCalibracion import schemas, exceptions
from src.planesCalibracion.models import PlanCalibracion
from src.planesCalibracion import exceptions as plan_exceptions

logger = logging.getLogger(__name__)


def crear_registro_calibracion(db: Session, plan_calibracion_id: int, registro: schemas.RegistroCalibracionCreate) -> schemas.RegistroCalibracion:
    plan = db.scalar(select(PlanCalibracion).where(PlanCalibracion.id == plan_calibracion_id))

    if plan is None:
        raise plan_exceptions.PlanCalibracionNoEncontrado()

    fecha_registro = registro.fecha or date.today()

    if fecha_registro > date.today():
        raise exceptions.FechaRegistroCalibracionInvalida()

    _registro = RegistroCalibracion(
        plan_calibracion_id=plan_calibracion_id,
        fecha=fecha_registro,
        observacion=registro.observacion
    )

    db.add(_registro)
    db.commit()
    db.refresh(_registro)

    return _registro


def listar_registros_calibracion(db: Session) -> List[schemas.RegistroCalibracion]:
    return db.scalars(select(RegistroCalibracion).order_by(RegistroCalibracion.fecha.desc())).all()


def listar_registros_por_plan(db: Session, plan_calibracion_id: int) -> List[schemas.RegistroCalibracion]:
    plan = db.scalar(select(PlanCalibracion).where(PlanCalibracion.id == plan_calibracion_id))

    if plan is None:
        raise plan_exceptions.PlanCalibracionNoEncontrado()

    return db.scalars(
        select(RegistroCalibracion)
        .where(RegistroCalibracion.plan_calibracion_id == plan_calibracion_id)
        .order_by(RegistroCalibracion.fecha.desc())
    ).all()


def leer_registro_calibracion(db: Session, registro_id: int) -> schemas.RegistroCalibracion:
    db_registro = db.scalar(select(RegistroCalibracion).where(RegistroCalibracion.id == registro_id))

    if db_registro is None:
        raise exceptions.RegistroCalibracionNoEncontrado()

    return db_registro