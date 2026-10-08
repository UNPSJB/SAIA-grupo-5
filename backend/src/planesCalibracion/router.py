import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.planesCalibracion import schemas, services
from src.auth.router_base import PermissionedRouter


logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/planes-calibracion", tags=["planes-calibracion"])


@router.post("/", response_model=schemas.PlanCalibracion)
def create_plan_calibracion(plan: schemas.PlanCalibracionCreate, db: Session = Depends(get_db)):
    return services.crear_plan_calibracion(db, plan)


@router.get("/", response_model=list[schemas.PlanCalibracion])
def read_planes_calibracion(db: Session = Depends(get_db)):
    return services.listar_planes_calibracion(db)


@router.get("/alertas", response_model=list[schemas.PlanCalibracion])
def read_planes_proximos_a_vencer(db: Session = Depends(get_db)):
    return services.listar_planes_proximos_a_vencer(db)


@router.get("/{plan_id}", response_model=schemas.PlanCalibracion)
def read_plan_calibracion(plan_id: int, db: Session = Depends(get_db)):
    return services.leer_plan_calibracion(db, plan_id)


@router.put("/{plan_id}", response_model=schemas.PlanCalibracion)
def update_plan_calibracion(plan_id: int, plan: schemas.PlanCalibracionUpdate, db: Session = Depends(get_db)):
    return services.modificar_plan_calibracion(db, plan_id, plan)


@router.patch("/{plan_id}/estado", response_model=schemas.PlanCalibracion)
def cambiar_estado_plan(plan_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_plan_calibracion(db, plan_id)