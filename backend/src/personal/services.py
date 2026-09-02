import logging
from typing import List
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from src.personal.models import Persona
from src.personal import schemas, exceptions

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

# operaciones CRUD para Personal
def crear_persona(db: Session, persona: schemas.PersonaCreate) -> schemas.Persona:
    _persona = Persona(**persona.model_dump())
    db.add(_persona)
    db.commit()
    db.refresh(_persona)
    return _persona

def listar_personas(db: Session) -> List[schemas.Persona]:
    logger.info("Listando personal desde services")
    return db.scalars(select(Persona)).all()

def leer_persona(db: Session, persona_id: int) -> schemas.Persona:
    db_persona = db.scalar(select(Persona).where(Persona.id == persona_id))
    if db_persona is None:
        raise exceptions.PersonaNoEncontrada()
    return db_persona

def modificar_persona(db: Session, persona_id: int, persona: schemas.PersonaUpdate) -> schemas.Persona:
    db_persona = leer_persona(db, persona_id)
    db.execute(update(Persona).where(Persona.id == persona_id).values(**persona.model_dump(exclude_unset=True))) #Uso exclude_unset=True para no sobreescribir los datos que no se envian
    db.commit()
    db.refresh(db_persona)
    return db_persona
