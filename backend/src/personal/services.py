import logging
from typing import List, Optional
from sqlalchemy import select, update, func
from sqlalchemy.orm import Session
from src.personal.models import Persona
from src.personal import schemas, exceptions
from src.auth.utils import get_password_hash

logger = logging.getLogger(__name__)


def _es_ultimo_administrador_activo(db: Session, persona_id: int) -> bool:
    """True si, sacando a persona_id, no queda ningún otro administrador activo."""
    otros_admins = db.scalar(
        select(func.count()).select_from(Persona).where(
            Persona.administrar.is_(True),
            Persona.activo.is_(True),
            Persona.id != persona_id,
        )
    )
    return otros_admins == 0


def crear_persona(db: Session, persona: schemas.PersonaCreate) -> Persona:
    if not persona.operar and not persona.administrar:
        raise exceptions.DebeTenerCapacidad()

    if db.scalar(select(Persona).where(Persona.username == persona.username)):
        raise exceptions.UsernameExistente()

    if db.scalar(select(Persona).where(Persona.dni == persona.dni)):
        raise exceptions.DniExistente()

    if db.scalar(select(Persona).where(Persona.mail == str(persona.mail))):
        raise exceptions.MailExistente()

    datos = persona.model_dump()
    password = datos.pop("password")
    hashed_password = get_password_hash(password)

    _persona = Persona(
        **datos,
        hashed_password=hashed_password,
        activo=True,
    )
    db.add(_persona)
    db.commit()
    db.refresh(_persona)
    return _persona


def listar_personas(db: Session) -> List[Persona]:
    logger.info("Listando personal desde services")
    return db.scalars(select(Persona)).all()


def leer_persona(db: Session, persona_id: int) -> Persona:
    db_persona = db.scalar(select(Persona).where(Persona.id == persona_id))
    if db_persona is None:
        raise exceptions.PersonaNoEncontrada()
    return db_persona


def leer_persona_por_username(db: Session, username: str) -> Persona:
    db_persona = db.scalar(select(Persona).where(Persona.username == username))
    if db_persona is None:
        raise exceptions.PersonaNoEncontrada()
    return db_persona


def modificar_persona(db: Session, persona_id: int, persona: schemas.PersonaUpdate) -> Persona:
    db_persona = leer_persona(db, persona_id)
    if not db_persona.activo:
        raise exceptions.PersonaDadaDeBaja()

    # Si se actualizan capacidades, validar que no queden ambas en falso
    nuevo_operar = persona.operar if persona.operar is not None else db_persona.operar
    nuevo_administrar = persona.administrar if persona.administrar is not None else db_persona.administrar
    if not nuevo_operar and not nuevo_administrar:
        raise exceptions.DebeTenerCapacidad()

    if db_persona.administrar and not nuevo_administrar and _es_ultimo_administrador_activo(db, persona_id):
        raise exceptions.UltimoAdministrador()

    # Validar unicidad si cambian dni o mail
    if persona.dni and persona.dni != db_persona.dni:
        if db.scalar(select(Persona).where(Persona.dni == persona.dni, Persona.id != persona_id)):
            raise exceptions.DniExistente()

    if persona.mail and str(persona.mail) != db_persona.mail:
        if db.scalar(select(Persona).where(Persona.mail == str(persona.mail), Persona.id != persona_id)):
            raise exceptions.MailExistente()

    valores = persona.model_dump(exclude_unset=True)
    if "mail" in valores and valores["mail"] is not None:
        valores["mail"] = str(valores["mail"])

    if "password" in valores:
        password = valores.pop("password")
        if password and password.strip():
            valores["hashed_password"] = get_password_hash(password)

    db.execute(update(Persona).where(Persona.id == persona_id).values(**valores))
    db.commit()
    db.refresh(db_persona)
    return db_persona


def cambiar_estado_persona(db: Session, persona_id: int) -> Persona:
    db_persona = leer_persona(db, persona_id)
    if db_persona.activo and db_persona.administrar and _es_ultimo_administrador_activo(db, persona_id):
        raise exceptions.UltimoAdministrador()
    db_persona.activo = not db_persona.activo
    db.commit()
    db.refresh(db_persona)
    return db_persona


def eliminar_persona(db: Session, persona_id: int) -> Persona:
    db_persona = leer_persona(db, persona_id)
    if db_persona.activo and db_persona.administrar and _es_ultimo_administrador_activo(db, persona_id):
        raise exceptions.UltimoAdministrador()
    db_persona.activo = False
    db.commit()
    db.refresh(db_persona)
    return db_persona