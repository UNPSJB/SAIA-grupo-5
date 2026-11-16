import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.aditivo import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/aditivos", tags=["aditivos"])


@router.post("/", response_model=schemas.Aditivo)
def create_aditivo(aditivo: schemas.AditivoCreate, db: Session = Depends(get_db)):
    return services.crear_aditivo(db, aditivo)

@router.get("/", response_model=list[schemas.Aditivo])
def read_aditivos(db: Session = Depends(get_db)):
    return services.listar_aditivos(db)

@router.get("/clases-funcionales", response_model=list[str])
def read_clases_funcionales():
    return services.listar_clases_funcionales()

@router.get("/{aditivo_id}", response_model=schemas.Aditivo)
def read_aditivo(aditivo_id: int, db: Session = Depends(get_db)):
    return services.leer_aditivo(db, aditivo_id)

@router.put("/{aditivo_id}", response_model=schemas.Aditivo)
def update_aditivo(aditivo_id: int, aditivo: schemas.AditivoUpdate, db: Session = Depends(get_db)):
    return services.modificar_aditivo(db, aditivo_id, aditivo)

@router.patch("/{aditivo_id}/estado", response_model=schemas.Aditivo)
def cambiar_estado_aditivo(aditivo_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_aditivo(db, aditivo_id)
