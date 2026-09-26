import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.recambiosElementosLimpieza import schemas, services
from src.auth.router_base import PermissionedRouter


logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/recambios-elementos-limpieza", tags=["recambios-elementos-limpieza"])


@router.post("/elemento/{elemento_id}", response_model=schemas.RecambioElementoLimpieza)
def create_recambio(elemento_id: int, recambio: schemas.RecambioElementoLimpiezaCreate, db: Session = Depends(get_db)):
    return services.crear_recambio(db, elemento_id, recambio)


@router.get("/", response_model=list[schemas.RecambioElementoLimpieza])
def read_recambios(db: Session = Depends(get_db)):
    return services.listar_recambios(db)


@router.get("/elemento/{elemento_id}", response_model=list[schemas.RecambioElementoLimpieza])
def read_recambios_por_elemento(elemento_id: int, db: Session = Depends(get_db)):
    return services.listar_recambios_por_elemento(db, elemento_id)


@router.get("/{recambio_id}", response_model=schemas.RecambioElementoLimpieza)
def read_recambio(recambio_id: int, db: Session = Depends(get_db)):
    return services.leer_recambio(db, recambio_id)