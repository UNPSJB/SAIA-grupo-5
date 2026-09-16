import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.plan_limpieza import schemas, services

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/planes-limpieza", tags=["planes-limpieza"])


# Rutas para PlanLimpieza

@router.post("/", response_model=schemas.PlanLimpieza)
def create_plan_limpieza(plan: schemas.PlanLimpiezaCreate, db: Session = Depends(get_db)):
    return services.crear_plan_limpieza(db, plan)

@router.get("/", response_model=list[schemas.PlanLimpieza])
def read_planes_limpieza(db: Session = Depends(get_db)):
    return services.listar_planes_limpieza(db)

@router.get("/{plan_limpieza_id}", response_model=schemas.PlanLimpieza)
def read_plan_limpieza(plan_limpieza_id: int, db: Session = Depends(get_db)):
    return services.leer_plan_limpieza(db, plan_limpieza_id)

@router.delete("/{plan_limpieza_id}", response_model=schemas.PlanLimpiezaDelete)
def delete_plan_limpieza(plan_limpieza_id: int, db: Session = Depends(get_db)):
    return services.eliminar_plan_limpieza(db, plan_limpieza_id)

@router.put("/{plan_limpieza_id}", response_model=schemas.PlanLimpieza)
def update_plan_limpieza(plan_limpieza_id: int, plan: schemas.PlanLimpiezaUpdate, db: Session = Depends(get_db)):
    return services.modificar_plan_limpieza(db, plan_limpieza_id, plan)
