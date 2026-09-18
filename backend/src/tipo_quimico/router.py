import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.tipo_quimico import schemas, services

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tipos-quimicos", tags=["tipos_quimicos"])




@router.post("/", response_model=schemas.TipoQuimico)
def create_tipo_quimico(tipo_quimico: schemas.TipoQuimicoCreate, db: Session = Depends(get_db)):
    return services.crear_tipo_quimico(db, tipo_quimico)

@router.get("/", response_model=list[schemas.TipoQuimico])
def read_tipos_quimicos(db: Session = Depends(get_db)):
    return services.listar_tipo_quimico(db)

@router.get("/{tipo_quimico_id}", response_model=schemas.TipoQuimico)
def read_tipo_quimico(tipo_quimico_id: int, db: Session = Depends(get_db)):
    return services.leer_tipo_quimico(db, tipo_quimico_id)

@router.delete("/{tipo_quimico_id}", response_model=schemas.TipoQuimicoDelete)
def delete_tipo_quimico(tipo_quimico_id: int, db: Session = Depends(get_db)):
    return services.eliminar_tipo_quimico(db, tipo_quimico_id)

@router.put("/{tipo_quimico_id}", response_model=schemas.TipoQuimico)
def update_tipo_quimico(tipo_quimico_id: int, tipo_quimico: schemas.TipoQuimicoUpdate, db: Session = Depends(get_db)):
    return services.modificar_tipo_quimico(db, tipo_quimico_id, tipo_quimico)