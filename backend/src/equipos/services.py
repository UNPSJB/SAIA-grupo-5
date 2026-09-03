import logging
from typing import List
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session
from src.equipos.models import Equipo
from src.equipos import schemas, exceptions

logger = logging.getLogger(__name__)

def crear_equipo(db: Session, equipo: schemas.EquipoCreate) -> schemas.Equipo:
    _equipo = Equipo(**equipo.model_dump())
    db.add(_equipo)
    db.commit()
    db.refresh(_equipo)
    return _equipo
    
def leer_equipo(db: Session, equipo_id: int) -> schemas.Equipo:
    db_equipo = db.scalar(select(Equipo).where(Equipo.id == equipo_id))
    if db_equipo is None:
        raise exceptions.EquipoNoEncontrado()
    return db_equipo

def eliminar_equipo(db: Session, equipo_id: int) -> schemas.Equipo:
    db_equipo = leer_equipo(db, equipo_id)
    #AGREGAR PLAN LIMPIEZA SI HAY UNA RESTRICCION
    db.execute(delete(Equipo).where(Equipo.id == equipo_id))
    db.commit()
    return db_equipo

