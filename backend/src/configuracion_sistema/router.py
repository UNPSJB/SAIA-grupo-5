import logging
from fastapi import Depends, Response
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.router_base import PermissionedRouter
from src.auth.dependencies import tiene_permiso_administrar
from src.configuracion_sistema import schemas, services, publica
from src.exceptions import NotFound

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/configuracion-sistema", tags=["configuracion_sistema"])


@router.get("/", response_model=schemas.ConfiguracionSistema, dependencies=[Depends(tiene_permiso_administrar)])
def read_configuracion(db: Session = Depends(get_db)):
    return services.leer_configuracion(db)



@router.put("/", response_model=schemas.ConfiguracionSistema)
def update_configuracion(configuracion: schemas.ConfiguracionSistemaUpdate, db: Session = Depends(get_db)):
    return services.modificar_configuracion(db, configuracion)

public_router = PermissionedRouter(prefix="/vista-publica", tags=["vista-publica"])


@public_router.get("/{token}", response_model=schemas.VistaPublica, dependencies=[])
def read_vista_publica(token: str, response: Response, db: Session = Depends(get_db)):
    vista = publica.leer_vista_publica(db, token)
    if vista is None:
        raise NotFound()
    response.headers["Cache-Control"] = "no-store, private"
    return vista
