from datetime import date
from fastapi import Depends
from sqlalchemy.orm import Session
from src.auth.dependencies import (
    get_current_persona,
    tiene_permiso_supervisor,
    tiene_permiso_supervisor_o_administrar,
)
from src.auth.router_base import PermissionedRouter
from src.database import get_db
from src.personal import models as personal_models
from src.supervision_lote import schemas, services

router = PermissionedRouter(prefix="/supervision-lotes", tags=["supervision-lotes"])


@router.get("/", response_model=list[schemas.SupervisionOcurrencia])
def read_checklist_supervision_activo(lote_id: int | None = None, db: Session = Depends(get_db)):
    return services.listar_checklist_activo(db, lote_id=lote_id)


@router.get("/historial", response_model=list[schemas.SupervisionOcurrencia], dependencies=[Depends(tiene_permiso_supervisor_o_administrar)])
def read_historial_supervision(fecha_desde: date, fecha_hasta: date, solo_mios: bool = False, db: Session = Depends(get_db), persona_actual: personal_models.Persona = Depends(get_current_persona),):
    supervisor_id = persona_actual.id if solo_mios else None
    return services.listar_historial_supervision(db, fecha_desde=fecha_desde, fecha_hasta=fecha_hasta, supervisor_id=supervisor_id)


@router.get("/lote/{lote_id}", response_model=list[schemas.SupervisionOcurrencia])
def read_ocurrencias_por_lote(lote_id: int, db: Session = Depends(get_db)):
    return services.listar_ocurrencias_por_lote(db, lote_id=lote_id)


@router.get("/{ocurrencia_id}", response_model=schemas.SupervisionOcurrencia)
def read_supervision_ocurrencia(ocurrencia_id: int, db: Session = Depends(get_db)):
    return services.leer_supervision_ocurrencia(db, ocurrencia_id=ocurrencia_id)


@router.put("/{ocurrencia_id}/completar", response_model=schemas.SupervisionOcurrencia, dependencies=[Depends(tiene_permiso_supervisor)])
def completar_supervision_ocurrencia(ocurrencia_id: int, datos: schemas.SupervisionOcurrenciaCompletar, db: Session = Depends(get_db), persona_actual: personal_models.Persona = Depends(get_current_persona),):
    return services.completar_supervision_ocurrencia(db, ocurrencia_id, datos, persona_actual)
