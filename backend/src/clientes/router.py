from typing import List
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.router_base import PermissionedRouter
from src.auth.dependencies import tiene_permiso_operar
from src.clientes import schemas, services

router = PermissionedRouter(prefix="/clientes", tags=["Clientes"])


@router.get("/", response_model=List[schemas.Cliente])
def get_clientes(db: Session = Depends(get_db)):
    return services.listar_clientes(db)


@router.get("/{cliente_id}", response_model=schemas.Cliente)
def get_cliente(cliente_id: int, db: Session = Depends(get_db)):
    return services.leer_cliente(db, cliente_id)


@router.post("/", response_model=schemas.Cliente)
def create_cliente(datos: schemas.ClienteCreate, db: Session = Depends(get_db)):
    return services.crear_cliente(db, datos)


@router.put("/{cliente_id}", response_model=schemas.Cliente,)
def update_cliente(cliente_id: int, datos: schemas.ClienteUpdate, db: Session = Depends(get_db)):
    return services.modificar_cliente(db, cliente_id, datos)


@router.patch("/{cliente_id}/estado", response_model=schemas.Cliente)
def cambiar_estado_cliente(cliente_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_cliente(db, cliente_id)