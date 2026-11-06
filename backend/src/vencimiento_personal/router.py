import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.router_base import PermissionedRouter
from src.vencimiento_personal import schemas, services

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/vencimiento-personal", tags=["vencimiento_personal"])


@router.post("/", response_model=schemas.VencimientoPersonal)
def create_vencimiento_personal(vencimiento: schemas.VencimientoPersonalCreate, db: Session = Depends(get_db)):
    return services.crear_vencimiento(db, vencimiento)


@router.post("/{vencimiento_id}/renovar", response_model=schemas.VencimientoPersonal)
def renovar_vencimiento_personal(vencimiento_id: int, vencimiento: schemas.VencimientoPersonalUpdate, db: Session = Depends(get_db)):
    return services.renovar_vencimiento(db, vencimiento_id, vencimiento)


@router.get("/persona/{persona_id}", response_model=list[schemas.VencimientoPersonal])
def read_vencimientos_persona(persona_id: int, db: Session = Depends(get_db)):
    return services.listar_vencimientos_actuales_persona(db, persona_id)


@router.get("/persona/{persona_id}/historico/{tipo_vencimiento_id}",response_model=list[schemas.VencimientoPersonal])
def read_historico_vencimiento_persona(persona_id: int, tipo_vencimiento_id: int, db: Session = Depends(get_db)):
    return services.listar_historico_persona(db, persona_id, tipo_vencimiento_id)


@router.get("/{vencimiento_id}", response_model=schemas.VencimientoPersonal)
def read_vencimiento_personal(vencimiento_id: int, db: Session = Depends(get_db)):
    return services.leer_vencimiento_personal(db, vencimiento_id)


@router.put("/{vencimiento_id}", response_model=schemas.VencimientoPersonal)
def update_vencimiento_personal(vencimiento_id: int,vencimiento: schemas.VencimientoPersonalUpdate,db: Session = Depends(get_db),):
    return services.modificar_vencimiento(db, vencimiento_id, vencimiento)

@router.get("/", response_model=list[schemas.VencimientoPersonal])
def read_vencimientos_personal(db: Session = Depends(get_db)):
    return services.listar_vencimientos_personal(db)