import logging
from sqlalchemy.orm import Session
from src.configuracion_sistema.models import ConfiguracionSistema
from src.configuracion_sistema import schemas
from src.configuracion_sistema.constants import ID_CONFIGURACION_SISTEMA

logger = logging.getLogger(__name__)


def obtener_o_crear_configuracion(db: Session) -> ConfiguracionSistema:
    
    # La configuración es una única fila (patrón singleton)
    db_configuracion = db.get(ConfiguracionSistema, ID_CONFIGURACION_SISTEMA)
    if db_configuracion is None:
        db_configuracion = ConfiguracionSistema(id=ID_CONFIGURACION_SISTEMA)
        db.add(db_configuracion)
        db.commit()
        db.refresh(db_configuracion)
    return db_configuracion


def leer_configuracion(db: Session) -> schemas.ConfiguracionSistema:
    return obtener_o_crear_configuracion(db)


def modificar_configuracion(db: Session, configuracion: schemas.ConfiguracionSistemaUpdate) -> schemas.ConfiguracionSistema:
    db_configuracion = obtener_o_crear_configuracion(db)

    for key, value in configuracion.model_dump().items():
        setattr(db_configuracion, key, value)

    db.commit()
    db.refresh(db_configuracion)

    # Para evitar import circular 
    # scheduler.py necesita leer esta configuración al arrancar
    from src.scheduler.scheduler import reprogramar_generacion_checklists
    reprogramar_generacion_checklists(
        db_configuracion.hora_generacion_checklists,
        db_configuracion.minuto_generacion_checklists,
    )

    return db_configuracion
