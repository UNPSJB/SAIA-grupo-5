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
    cambios = configuracion.model_dump(exclude_unset=True)

    if any(clave.startswith("vista_publica_") for clave in cambios):
        from src.configuracion_sistema.publica import actualizar_vista_publica

        datos_vista = schemas.ConfiguracionSistemaUpdate.model_validate({
            clave: valor for clave, valor in cambios.items() if clave.startswith("vista_publica_")
        })
        db_configuracion = actualizar_vista_publica(db, datos_vista)

    for clave, valor in cambios.items():
        if not clave.startswith("vista_publica_") and (valor is not None or clave == "logo_pyme"):
            setattr(db_configuracion, clave, valor)

    db.commit()
    db.refresh(db_configuracion)

    if any(clave in cambios for clave in ("hora_generacion_checklists", "minuto_generacion_checklists")):
        from src.scheduler.scheduler import reprogramar_generacion_checklists

        reprogramar_generacion_checklists(
            db_configuracion.hora_generacion_checklists,
            db_configuracion.minuto_generacion_checklists,
        )

    return db_configuracion
