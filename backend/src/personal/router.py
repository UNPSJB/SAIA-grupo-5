import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.personal import schemas, services

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/personal", tags=["personal"])


@router.get("/", response_model=list[schemas.Persona])
def read_personas(db: Session = Depends(get_db)):
    logger.info("Consultando la lista de personal desde endpoint...")
    return services.listar_personas(db)


@router.get("/{persona_id}", response_model=schemas.Persona)
def read_persona(persona_id: int, db: Session = Depends(get_db)):
    return services.leer_persona(db, persona_id)
