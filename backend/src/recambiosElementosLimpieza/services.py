import logging
from datetime import date
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.recambiosElementosLimpieza.models import RecambioElementoLimpieza
from src.recambiosElementosLimpieza import schemas, exceptions
from src.elementosLimpieza.models import ElementoLimpieza
from src.elementosLimpieza import exceptions as elemento_exceptions

logger = logging.getLogger(__name__)


def crear_recambio(db: Session, elemento_id: int, recambio: schemas.RecambioElementoLimpiezaCreate) -> schemas.RecambioElementoLimpieza:
    elemento = db.scalar(
        select(ElementoLimpieza)
        .where(ElementoLimpieza.id == elemento_id)
    )

    if elemento is None:
        raise elemento_exceptions.ElementoLimpiezaNoEncontrado()

    fecha_recambio = recambio.fecha or date.today()

    if fecha_recambio > date.today():
        raise exceptions.FechaRecambioInvalida()

    _recambio = RecambioElementoLimpieza(
        elemento_id=elemento_id,
        fecha=fecha_recambio,
        observacion=recambio.observacion
    )

    db.add(_recambio)
    db.commit()
    db.refresh(_recambio)

    return _recambio


def listar_recambios(db: Session) -> List[schemas.RecambioElementoLimpieza]:
    return db.scalars(
        select(RecambioElementoLimpieza)
        .order_by(RecambioElementoLimpieza.fecha.desc())
    ).all()


def listar_recambios_por_elemento(db: Session, elemento_id: int) -> List[schemas.RecambioElementoLimpieza]:
    elemento = db.scalar(
        select(ElementoLimpieza)
        .where(ElementoLimpieza.id == elemento_id)
    )

    if elemento is None:
        raise elemento_exceptions.ElementoLimpiezaNoEncontrado()

    return db.scalars(
        select(RecambioElementoLimpieza)
        .where(RecambioElementoLimpieza.elemento_id == elemento_id)
        .order_by(RecambioElementoLimpieza.fecha.desc())
    ).all()


def leer_recambio(db: Session, recambio_id: int) -> schemas.RecambioElementoLimpieza:
    db_recambio = db.scalar(
        select(RecambioElementoLimpieza)
        .where(RecambioElementoLimpieza.id == recambio_id)
    )

    if db_recambio is None:
        raise exceptions.RecambioElementoLimpiezaNoEncontrado()

    return db_recambio