import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.personal import schemas, services, models
from src.auth.dependencies import tiene_permiso_administrar, get_current_persona
from src.exceptions import PermissionDenied

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/personal", tags=["personal"])


@router.post("/", response_model=schemas.Persona)
def create_persona(
    persona: schemas.PersonaCreate,
    db: Session = Depends(get_db),
    _admin: models.Persona = Depends(tiene_permiso_administrar),
):
    return services.crear_persona(db, persona)


@router.get("/", response_model=list[schemas.Persona])
def read_personas(
    db: Session = Depends(get_db),
    _admin: models.Persona = Depends(tiene_permiso_administrar),
):
    logger.info("Consultando la lista de personal desde endpoint...")
    return services.listar_personas(db)


@router.get("/{persona_id}", response_model=schemas.Persona)
def read_persona(
    persona_id: int,
    db: Session = Depends(get_db),
    current_persona: models.Persona = Depends(get_current_persona),
):
    if not current_persona.administrar and current_persona.id != persona_id:
        raise PermissionDenied()
    return services.leer_persona(db, persona_id)


@router.put("/{persona_id}", response_model=schemas.Persona)
def update_persona(
    persona_id: int,
    persona: schemas.PersonaUpdate,
    db: Session = Depends(get_db),
    _admin: models.Persona = Depends(tiene_permiso_administrar),
):
    return services.modificar_persona(db, persona_id, persona)


@router.patch("/{persona_id}/estado", response_model=schemas.Persona)
def change_persona_status(
    persona_id: int,
    db: Session = Depends(get_db),
    _admin: models.Persona = Depends(tiene_permiso_administrar),
):
    return services.cambiar_estado_persona(db, persona_id)


@router.delete("/{persona_id}", response_model=schemas.Persona)
def delete_persona(
    persona_id: int,
    db: Session = Depends(get_db),
    _admin: models.Persona = Depends(tiene_permiso_administrar),
):
    return services.eliminar_persona(db, persona_id)
