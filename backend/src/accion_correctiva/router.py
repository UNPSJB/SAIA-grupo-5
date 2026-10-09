import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.accion_correctiva import schemas, services
from src.auth.router_base import PermissionedRouter
from src.auth.dependencies import get_current_persona

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/acciones-correctivas", tags=["acciones-correctivas"])

@router.post("/", response_model=schemas.AccionCorrectiva)
def create_accion_correctiva(
    accion_correctiva: schemas.AccionCorrectivaCreate,
    db: Session = Depends(get_db),
    persona = Depends(get_current_persona),
):
    return services.crear_accion_correctiva(db, accion_correctiva, persona)

@router.get("/", response_model=list[schemas.AccionCorrectiva])
def read_acciones_correctivas(db: Session = Depends(get_db)):
    return services.listar_acciones_correctivas(db)

@router.get("/incidente/{incidente_id}", response_model=list[schemas.AccionCorrectiva])
def read_acciones_correctivas_de_incidente(incidente_id: int, db: Session = Depends(get_db)):
    return services.listar_acciones_correctivas_por_incidente(db, incidente_id)

@router.get("/{accion_correctiva_id}", response_model=schemas.AccionCorrectiva)
def read_accion_correctiva(accion_correctiva_id: int, db: Session = Depends(get_db)):
    return services.leer_accion_correctiva(db, accion_correctiva_id)

# Unicamente descripción
@router.put("/{accion_correctiva_id}", response_model=schemas.AccionCorrectiva)
def update_accion_correctiva(accion_correctiva_id: int, accion_correctiva: schemas.AccionCorrectivaUpdate, db: Session = Depends(get_db)):
    return services.modificar_accion_correctiva(db, accion_correctiva_id, accion_correctiva)

@router.patch("/{accion_correctiva_id}/estado", response_model=schemas.AccionCorrectiva)
def cambiar_estado_accion_correctiva(accion_correctiva_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_accion_correctiva(db, accion_correctiva_id)
