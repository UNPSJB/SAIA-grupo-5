import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from src.incidentes.models import Incidente
from src.incidentes import exceptions, schemas
from src.incidentes.constants import EstadoIncidente

logger = logging.getLogger(__name__)


def crear_incidente(db: Session, incidente: schemas.IncidenteCreate, persona) -> schemas.Incidente:    
    datos = incidente.model_dump()
    datos["operario_id"] = persona.id
    datos["fecha_abierto"] = datetime.now()
    
    _incidente = Incidente(**datos)
    db.add(_incidente)
    db.commit()
    db.refresh(_incidente)
    return _incidente

def leer_incidente(db: Session, incidente_id: int) -> schemas.Incidente:
    db_incidente = db.scalar(select(Incidente).where(Incidente.id == incidente_id).options(joinedload(Incidente.tipo)))       
    if db_incidente is None:
        raise exceptions.IncidenteNoEncontrado()
    return db_incidente

def modificar_incidente(db: Session, incidente_id: int, incidente: schemas.IncidenteUpdate) -> schemas.Incidente:
    db_incidente = leer_incidente(db, incidente_id)
    db_incidente.nombre = incidente.nombre
    db_incidente.descripcion = incidente.descripcion
    
    db.commit()
    db.refresh(db_incidente)
    return db_incidente

def cambiar_estado_incidente(db: Session, incidente_id: int) -> schemas.Incidente:
    db_incidente = leer_incidente(db, incidente_id)
    if db_incidente is None:
            raise exceptions.IncidenteNoEncontrado()
    
    db_incidente.activo = not db_incidente.activo
    db.commit()
    db.refresh(db_incidente)
    return db_incidente

#listados
def listar_incidentes(db: Session) -> List[schemas.Incidente]:
    return db.scalars(select(Incidente).options(joinedload(Incidente.tipo))).all()

def listar_incidentes_abiertos(db: Session) -> List[schemas.Incidente]:
    return db.scalars(
        select(Incidente).options(joinedload(Incidente.tipo)).where(Incidente.estado == EstadoIncidente.ABIERTO)
    ).all()

def listar_incidentes_cerrados(db: Session) -> List[schemas.Incidente]:
    return db.scalars(
        select(Incidente).options(joinedload(Incidente.tipo)).where(Incidente.estado == EstadoIncidente.CERRADO)
    ).all()