import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.elementosLimpieza import schemas, services


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/elementos-limpieza", tags=["elementos-limpieza"])


""" Routers para tipo elemento limpieza """
@router.post("/tipos", response_model=schemas.TipoElementoLimpieza)
def create_tipo_elemento_limpieza(tipo: schemas.TipoElementoLimpiezaCreate, db: Session = Depends(get_db)):
    return services.crear_tipo_elemento_limpieza(db, tipo)

@router.get("/tipos", response_model=list[schemas.TipoElementoLimpieza])
def read_tipos_elemento_limpieza(db: Session = Depends(get_db)):
    return services.listar_tipos_elemento_limpieza(db)

@router.get("/tipos/{tipo_id}", response_model=schemas.TipoElementoLimpieza)
def read_tipo_elemento_limpieza(tipo_id: int, db: Session = Depends(get_db)):
    return services.leer_tipo_elemento_limpieza(db, tipo_id)

@router.put("/tipos/{tipo_id}", response_model=schemas.TipoElementoLimpieza)
def update_tipo_elemento_limpieza(tipo_id: int, tipo: schemas.TipoElementoLimpiezaUpdate, db: Session = Depends(get_db)):
    return services.modificar_tipo_elemento_limpieza(db, tipo_id, tipo)

@router.delete("/tipos/{tipo_id}", response_model=schemas.TipoElementoLimpieza)
def delete_tipo_elemento_limpieza(tipo_id: int, db: Session = Depends(get_db)):
    return services.eliminar_tipo_elemento_limpieza(db, tipo_id)


""" Routers para elemento limpieza """
@router.post("/", response_model=schemas.ElementoLimpieza)
def create_elemento_limpieza(elemento: schemas.ElementoLimpiezaCreate, db: Session = Depends(get_db)):
    return services.crear_elemento_limpieza(db, elemento)

@router.get("/", response_model=list[schemas.ElementoLimpieza])
def read_elementos_limpieza(db: Session = Depends(get_db)):
    return services.listar_elementos_limpieza(db)

@router.get("/{elemento_id}", response_model=schemas.ElementoLimpieza)
def read_elemento_limpieza(elemento_id: int, db: Session = Depends(get_db)):
    return services.leer_elemento_limpieza(db, elemento_id)

@router.put("/{elemento_id}", response_model=schemas.ElementoLimpieza)
def update_elemento_limpieza(elemento_id: int, elemento: schemas.ElementoLimpiezaUpdate, db: Session = Depends(get_db)):
    return services.modificar_elemento_limpieza(db, elemento_id, elemento)

@router.delete("/{elemento_id}", response_model=schemas.ElementoLimpieza)
def delete_elemento_limpieza(elemento_id: int, db: Session = Depends(get_db)):
    return services.eliminar_elemento_limpieza(db, elemento_id)