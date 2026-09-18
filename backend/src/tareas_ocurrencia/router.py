import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.tareas_ocurrencia import schemas, services

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tareas-ocurrencia", tags=["tareas-ocurrencia"])


# Rutas para TareaOcurrencia

@router.post("/", response_model=schemas.TareaOcurrencia)
def create_tarea_ocurrencia(ocurrencia: schemas.TareaOcurrenciaCreate, db: Session = Depends(get_db)):
    return services.crear_tarea_ocurrencia(db, ocurrencia)

# Solo para desarrollo/testing
# Revia las tareas con su ultima fecha de creación y genera las faltantes
@router.post("/generar-manual", response_model=list[schemas.TareaOcurrencia])
def generar_manual(db: Session = Depends(get_db)):
    return services.generar_ocurrencias_manual(db)

@router.get("/", response_model=list[schemas.TareaOcurrencia])
def read_tareas_ocurrencia(db: Session = Depends(get_db)):
    return services.listar_tareas_ocurrencia(db)

@router.get("/pendientes", response_model=list[schemas.TareaOcurrencia])
def read_tareas_ocurrencia_pendientes(db: Session = Depends(get_db)):
    return services.listar_tareas_ocurrencia_pendientes(db)

@router.get("/completadas", response_model=list[schemas.TareaOcurrencia])
def read_tareas_ocurrencia_pendientes(db: Session = Depends(get_db)):
    return services.listar_tareas_ocurrencia_completadas(db)

@router.get("/{ocurrencia_id}", response_model=schemas.TareaOcurrencia)
def read_tarea_ocurrencia(ocurrencia_id: int, db: Session = Depends(get_db)):
    return services.leer_tarea_ocurrencia(db, ocurrencia_id)

@router.put("/{ocurrencia_id}/completar", response_model=schemas.TareaOcurrencia)
def completar_tarea_ocurrencia(
    ocurrencia_id: int, datos: schemas.TareaOcurrenciaCompletar, db: Session = Depends(get_db)
):
    return services.completar_tarea_ocurrencia(db, ocurrencia_id, datos)

@router.delete("/{ocurrencia_id}", response_model=schemas.TareaOcurrencia)
def delete_tarea_ocurrencia(ocurrencia_id: int, db: Session = Depends(get_db)):
    return services.eliminar_tarea_ocurrencia(db, ocurrencia_id)
