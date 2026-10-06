import logging
from datetime import date, timedelta
from typing import List
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from src.planesCalibracion.models import PlanCalibracion
from src.planesCalibracion import schemas, exceptions, constants
from src.registrosCalibracion.models import RegistroCalibracion
from src.equipos.models import Equipo
from src.equipos import exceptions as equipo_exceptions

logger = logging.getLogger(__name__)


def calcular_proxima_fecha(db: Session, plan: PlanCalibracion) -> date:
    ultimo_registro = db.scalar(
        select(RegistroCalibracion)
        .where(RegistroCalibracion.plan_calibracion_id == plan.id)
        .order_by(RegistroCalibracion.fecha.desc())
    )

    fecha_base = ultimo_registro.fecha if ultimo_registro else plan.fecha_inicio
    proxima_fecha = fecha_base + timedelta(days=plan.periodicidad)

    return proxima_fecha


def calcular_dias_restantes(db: Session, plan: PlanCalibracion) -> int:
    proxima_fecha = calcular_proxima_fecha(db, plan)

    return (proxima_fecha - date.today()).days


def crear_plan_calibracion(db: Session, plan: schemas.PlanCalibracionCreate) -> schemas.PlanCalibracion:
    equipo = db.scalar(select(Equipo).where(Equipo.id == plan.equipo_id))

    if equipo is None:
        raise equipo_exceptions.EquipoNoEncontrado()

    if plan.fecha_inicio > date.today():
        raise exceptions.FechaPlanCalibracionInvalida()

    plan_existente = db.scalar(select(PlanCalibracion).where(PlanCalibracion.equipo_id == plan.equipo_id))

    if plan_existente:
        raise exceptions.PlanCalibracionDuplicado()

    _plan = PlanCalibracion(**plan.model_dump())

    db.add(_plan)
    db.commit()
    db.refresh(_plan)

    plan_schema = schemas.PlanCalibracion.model_validate(_plan)
    plan_schema.proxima_fecha = calcular_proxima_fecha(db, _plan)
    plan_schema.dias_restantes = calcular_dias_restantes(db, _plan)

    return plan_schema


def listar_planes_calibracion(db: Session) -> List[schemas.PlanCalibracion]:
    planes = db.scalars(select(PlanCalibracion)).all()

    resultado = []

    for plan in planes:
        plan_schema = schemas.PlanCalibracion.model_validate(plan)
        plan_schema.proxima_fecha = calcular_proxima_fecha(db, plan)
        plan_schema.dias_restantes = calcular_dias_restantes(db, plan)
        resultado.append(plan_schema)

    return resultado


def listar_planes_proximos_a_vencer(db: Session, dias_umbral: int = constants.DIAS_ALERTA_CALIBRACION) -> List[schemas.PlanCalibracion]:
    planes = db.scalars(select(PlanCalibracion).where(PlanCalibracion.estado == True)).all()

    resultado = []

    for plan in planes:
        dias_restantes = calcular_dias_restantes(db, plan)

        if dias_restantes > dias_umbral:
            continue

        plan_schema = schemas.PlanCalibracion.model_validate(plan)
        plan_schema.proxima_fecha = calcular_proxima_fecha(db, plan)
        plan_schema.dias_restantes = dias_restantes
        resultado.append(plan_schema)

    return resultado


def leer_plan_calibracion_modelo(db: Session, plan_id: int) -> PlanCalibracion:
    db_plan = db.get(PlanCalibracion, plan_id)

    if db_plan is None:
        raise exceptions.PlanCalibracionNoEncontrado()

    return db_plan


def leer_plan_calibracion(db: Session, plan_id: int) -> schemas.PlanCalibracion:
    db_plan = db.scalar(select(PlanCalibracion).where(PlanCalibracion.id == plan_id))

    if db_plan is None:
        raise exceptions.PlanCalibracionNoEncontrado()

    plan_schema = schemas.PlanCalibracion.model_validate(db_plan)
    plan_schema.proxima_fecha = calcular_proxima_fecha(db, db_plan)
    plan_schema.dias_restantes = calcular_dias_restantes(db, db_plan)

    return plan_schema


def modificar_plan_calibracion(db: Session, plan_id: int, plan: schemas.PlanCalibracionUpdate) -> schemas.PlanCalibracion:
    db_plan = leer_plan_calibracion_modelo(db, plan_id)

    db.execute(
        update(PlanCalibracion)
        .where(PlanCalibracion.id == plan_id)
        .values(**plan.model_dump(exclude_unset=True))
    )

    db.commit()
    db.refresh(db_plan)

    plan_schema = schemas.PlanCalibracion.model_validate(db_plan)
    plan_schema.proxima_fecha = calcular_proxima_fecha(db, db_plan)
    plan_schema.dias_restantes = calcular_dias_restantes(db, db_plan)

    logger.info(
        f"Se actualizo correctamente el plan de calibracion: "
        f"{db_plan.id}"
    )

    return plan_schema


def cambiar_estado_plan_calibracion(db: Session, plan_id: int) -> schemas.PlanCalibracion:
    db_plan = leer_plan_calibracion_modelo(db, plan_id)

    db_plan.estado = not db_plan.estado

    db.commit()
    db.refresh(db_plan)

    plan_schema = schemas.PlanCalibracion.model_validate(db_plan)
    plan_schema.proxima_fecha = calcular_proxima_fecha(db, db_plan)
    plan_schema.dias_restantes = calcular_dias_restantes(db, db_plan)

    return plan_schema