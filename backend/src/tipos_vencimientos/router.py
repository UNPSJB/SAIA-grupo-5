import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.router_base import PermissionedRouter
from src.tipos_vencimientos import schemas, services

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/tipos-vencimientos", tags=["tipos_vencimientos"])

@router.post("/", response_model=schemas.TipoVencimiento)
def create_tipo_vencimiento(tipo_vencimiento: schemas.TipoVencimientoCreate, db: Session = Depends(get_db)):
    return services.crear_tipo_vencimiento(db, tipo_vencimiento)

@router.get("/", response_model=list[schemas.TipoVencimiento])
def read_tipos_vencimientos(db: Session = Depends(get_db)):
    return services.listar_tipos_vencimientos(db)

@router.get("/{tipo_vencimiento_id}", response_model=schemas.TipoVencimiento)
def read_tipo_vencimiento(tipo_vencimiento_id: int, db: Session = Depends(get_db)):
    return services.leer_tipo_vencimiento(db, tipo_vencimiento_id)

@router.put("/{tipo_vencimiento_id}", response_model=schemas.TipoVencimiento)
def update_tipo_vencimiento(tipo_vencimiento_id: int, tipo_vencimiento: schemas.TipoVencimientoUpdate, db: Session = Depends(get_db)):
    return services.modificar_tipo_vencimiento(db, tipo_vencimiento_id, tipo_vencimiento)

@router.patch("/{tipo_vencimiento_id}/estado", response_model=schemas.TipoVencimiento)
def cambiar_estado_tipo_vencimiento(tipo_vencimiento_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_tipo_vencimiento(db, tipo_vencimiento_id)