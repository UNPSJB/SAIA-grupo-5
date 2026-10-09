import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.incidentes import schemas, services
from src.auth.router_base import PermissionedRouter
from src.auth.dependencies import get_current_persona

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/incidentes", tags=["incidentes"])

@router.post("/", response_model=schemas.Incidente)
def create_incidente(incidente: schemas.IncidenteCreate, db: Session = Depends(get_db), persona = Depends(get_current_persona)):
    return services.crear_incidente(db, incidente, persona)

@router.get("/{incidente_id}", response_model=schemas.Incidente)
def read_incidente(incidente_id: int, db: Session = Depends(get_db)):
    return services.leer_incidente(db, incidente_id)

@router.put("/{incidente_id}", response_model=schemas.Incidente)
def update_incidente(incidente_id: int, incidente: schemas.IncidenteUpdate, db: Session = Depends(get_db)):
    return services.modificar_incidente(db, incidente_id, incidente)

@router.patch("/{incidente_id}/estado", response_model=schemas.Incidente)
def cambiar_estado_incidente(incidente_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_incidente(db, incidente_id)

#lista todos los incidentes
@router.get("/", response_model=list[schemas.Incidente])
def read_incidentes(db: Session = Depends(get_db)):
    return services.listar_incidentes(db)

@router.get("/abiertos", response_model=list[schemas.Incidente])
def read_incidentes_abiertos(db: Session = Depends(get_db)):
    return services.listar_incidentes_abiertos(db)

@router.get("/cerrados", response_model=list[schemas.Incidente])
def read_incidentes_cerrados(db: Session = Depends(get_db)):
    return services.listar_incidentes_cerrados(db)
