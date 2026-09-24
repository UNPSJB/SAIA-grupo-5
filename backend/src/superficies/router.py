import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.superficies import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/superficies", tags=["superficies"])


# Rutas para Superficies

@router.post("/", response_model=schemas.Superficie)
def create_superficie(superficie: schemas.SuperficieCreate, db: Session = Depends(get_db)):
    return services.crear_superficie(db, superficie)

@router.get("/", response_model=list[schemas.Superficie])
def read_superficies(db: Session = Depends(get_db)):
    return services.listar_superficies(db)

@router.get("/{superficie_id}", response_model=schemas.Superficie)
def read_superficie(superficie_id: int, db: Session = Depends(get_db)):
    return services.leer_superficie(db, superficie_id)

@router.delete("/{superficie_id}", response_model=schemas.SuperficieDelete)
def delete_superficie(superficie_id: int, db: Session = Depends(get_db)):
    return services.eliminar_superficie(db, superficie_id)

@router.put("/{superficie_id}", response_model=schemas.Superficie)
def update_superficie(superficie_id: int, superficie: schemas.SuperficieUpdate, db: Session = Depends(get_db)):
    return services.modificar_superficie(db, superficie_id, superficie)
