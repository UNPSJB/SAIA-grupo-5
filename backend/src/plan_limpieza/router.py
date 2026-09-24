import logging
from datetime import date
from fastapi import Depends, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.plan_limpieza import schemas, services
from src.tareas_ocurrencia import schemas as ocurrencia_schemas
from src.tareas_ocurrencia.services import obtener_checklist
from src.tarea import schemas as tarea_schemas
from src.tarea import services as tarea_services
from src.auth.router_base import PermissionedRouter

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/planes-limpieza", tags=["planes-limpieza"])


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

@router.get("/{plan_limpieza_id}/checklist", response_model=list[ocurrencia_schemas.TareaOcurrencia])
def read_checklist(plan_limpieza_id: int, fecha: date | None = Query(None), db: Session = Depends(get_db)):
    return obtener_checklist(db, plan_limpieza_id, fecha)

@router.get("/{plan_limpieza_id}/tareas/sectores", response_model=list[tarea_schemas.Tarea])
def read_tareas_de_sectores(plan_limpieza_id: int, db: Session = Depends(get_db)):
    services.leer_plan_limpieza(db, plan_limpieza_id)
    return tarea_services.listar_tareas_de_sector_por_plan(db, plan_limpieza_id)

@router.get("/{plan_limpieza_id}/tareas/superficies", response_model=list[tarea_schemas.Tarea])
def read_tareas_de_superficies(plan_limpieza_id: int, db: Session = Depends(get_db)):
    services.leer_plan_limpieza(db, plan_limpieza_id)
    return tarea_services.listar_tareas_de_superficie_por_plan(db, plan_limpieza_id)

@router.get("/{plan_limpieza_id}/tareas/equipos", response_model=list[tarea_schemas.Tarea])
def read_tareas_de_equipos(plan_limpieza_id: int, db: Session = Depends(get_db)):
    services.leer_plan_limpieza(db, plan_limpieza_id)
    return tarea_services.listar_tareas_de_equipo_por_plan(db, plan_limpieza_id)
