import logging
from fastapi import Depends, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.tarea import schemas, services
from src.auth.router_base import PermissionedRouter

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/tareas", tags=["tareas"])


# Rutas para Tarea

@router.post("/", response_model=schemas.Tarea)
def create_tarea(tarea: schemas.TareaCreate, db: Session = Depends(get_db)):
    return services.crear_tarea(db, tarea)

@router.get("/", response_model=list[schemas.Tarea])
def read_tareas(plan_id: int | None = Query(None), db: Session = Depends(get_db)):
    return services.listar_tareas(db, plan_id)

@router.get("/{tarea_id}", response_model=schemas.Tarea)
def read_tarea(tarea_id: int, db: Session = Depends(get_db)):
    return services.leer_tarea(db, tarea_id)

@router.delete("/{tarea_id}", response_model=schemas.TareaDelete)
def delete_tarea(tarea_id: int, db: Session = Depends(get_db)):
    return services.eliminar_tarea(db, tarea_id)

@router.put("/{tarea_id}", response_model=schemas.Tarea)
def update_tarea(tarea_id: int, tarea: schemas.TareaUpdate, db: Session = Depends(get_db)):
    return services.modificar_tarea(db, tarea_id, tarea)
