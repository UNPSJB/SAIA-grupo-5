import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.tipo_quimico import schemas, services
from src.auth.dependencies import tiene_permiso_administrar
from src.auth.router_base import PermissionedRouter

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/tipos-quimicos", tags=["tipos_quimicos"])


@router.post("/", response_model=schemas.TipoQuimico)
def create_tipo_quimico(tipo_quimico: schemas.TipoQuimicoCreate, db: Session = Depends(get_db)):
    return services.crear_tipo_quimico(db, tipo_quimico)

""" Excepción a la regla por default: el listado completo y leer un tipo quimico también requiere admin. """
@router.get("/", response_model=list[schemas.TipoQuimico], dependencies=[Depends(tiene_permiso_administrar)])
def read_tipos_quimicos(db: Session = Depends(get_db)):
    return services.listar_tipo_quimico(db)

@router.get("/{tipo_quimico_id}", response_model=schemas.TipoQuimico, dependencies=[Depends(tiene_permiso_administrar)])
def read_tipo_quimico(tipo_quimico_id: int, db: Session = Depends(get_db)):
    return services.leer_tipo_quimico(db, tipo_quimico_id)

@router.put("/{tipo_quimico_id}", response_model=schemas.TipoQuimico)
def update_tipo_quimico(tipo_quimico_id: int, tipo_quimico: schemas.TipoQuimicoUpdate, db: Session = Depends(get_db)):
    return services.modificar_tipo_quimico(db, tipo_quimico_id, tipo_quimico)

@router.patch("/{tipo_quimico_id}/estado", response_model=schemas.TipoQuimico)
def cambiar_estado_tipo_quimico(tipo_quimico_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_tipo_quimico(db, tipo_quimico_id)