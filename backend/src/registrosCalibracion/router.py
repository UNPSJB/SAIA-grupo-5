import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.registrosCalibracion import schemas, services
from src.auth.router_base import PermissionedRouter


logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/registros-calibracion", tags=["registros-calibracion"])


@router.post("/plan/{plan_calibracion_id}", response_model=schemas.RegistroCalibracion)
def create_registro_calibracion(plan_calibracion_id: int, registro: schemas.RegistroCalibracionCreate, db: Session = Depends(get_db)):
    return services.crear_registro_calibracion(db, plan_calibracion_id, registro)


@router.get("/", response_model=list[schemas.RegistroCalibracion])
def read_registros_calibracion(db: Session = Depends(get_db)):
    return services.listar_registros_calibracion(db)


@router.get("/plan/{plan_calibracion_id}", response_model=list[schemas.RegistroCalibracion])
def read_registros_por_plan(plan_calibracion_id: int, db: Session = Depends(get_db)):
    return services.listar_registros_por_plan(db, plan_calibracion_id)


@router.get("/{registro_id}", response_model=schemas.RegistroCalibracion)
def read_registro_calibracion(registro_id: int, db: Session = Depends(get_db)):
    return services.leer_registro_calibracion(db, registro_id)