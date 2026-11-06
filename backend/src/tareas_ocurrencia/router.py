import logging
from datetime import date
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.tareas_ocurrencia import schemas, services
from src.auth.router_base import PermissionedRouter
from src.auth.dependencies import get_current_persona, tiene_permiso_administrar

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/tareas-ocurrencia", tags=["tareas-ocurrencia"])


# Rutas para TareaOcurrencia

@router.post("/", response_model=schemas.TareaOcurrencia)
def create_tarea_ocurrencia(ocurrencia: schemas.TareaOcurrenciaCreate, db: Session = Depends(get_db)):
    return services.crear_tarea_ocurrencia(db, ocurrencia)

# Revisa las tareas con su ultima fecha de creación y genera las faltantes
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

# Solo admin
@router.get(
    "/historial",
    response_model=list[schemas.TareaOcurrencia],
    dependencies=[Depends(tiene_permiso_administrar)],
)
def read_historial(fecha_desde: date, fecha_hasta: date, db: Session = Depends(get_db)):
    return services.listar_historial(db, fecha_desde, fecha_hasta)

@router.get("/{ocurrencia_id}", response_model=schemas.TareaOcurrencia)
def read_tarea_ocurrencia(ocurrencia_id: int, db: Session = Depends(get_db)):
    return services.leer_tarea_ocurrencia(db, ocurrencia_id)

@router.put(
    "/{ocurrencia_id}/completar",
    response_model=schemas.TareaOcurrencia,
    dependencies=[Depends(get_current_persona)],
)
def completar_tarea_ocurrencia(
    ocurrencia_id: int, datos: schemas.TareaOcurrenciaCompletar, db: Session = Depends(get_db)
):
    return services.completar_tarea_ocurrencia(db, ocurrencia_id, datos)

@router.delete("/{ocurrencia_id}", response_model=schemas.TareaOcurrencia)
def delete_tarea_ocurrencia(ocurrencia_id: int, db: Session = Depends(get_db)):
    return services.eliminar_tarea_ocurrencia(db, ocurrencia_id)
