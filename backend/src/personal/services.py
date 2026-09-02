import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.personal.models import Persona
from src.personal import schemas, exceptions

logger = logging.getLogger(__name__)


def listar_personas(db: Session) -> List[schemas.Persona]:
    logger.info("Listando personal desde services")
    return db.scalars(select(Persona)).all()


def leer_persona(db: Session, persona_id: int) -> schemas.Persona:
    db_persona = db.scalar(select(Persona).where(Persona.id == persona_id))
    if db_persona is None:
        raise exceptions.PersonaNoEncontrada()
    return db_persona
