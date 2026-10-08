import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.router_base import PermissionedRouter
from src.auth.dependencies import tiene_permiso_administrar
from src.configuracion_sistema import schemas, services

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/configuracion-sistema", tags=["configuracion_sistema"])


# Excepción a la regla por default: solo admin GET
@router.get("/", response_model=schemas.ConfiguracionSistema, dependencies=[Depends(tiene_permiso_administrar)])
def read_configuracion(db: Session = Depends(get_db)):
    return services.leer_configuracion(db)


@router.put("/", response_model=schemas.ConfiguracionSistema)
def update_configuracion(configuracion: schemas.ConfiguracionSistemaUpdate, db: Session = Depends(get_db)):
    return services.modificar_configuracion(db, configuracion)
