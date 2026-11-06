from typing import List
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.router_base import PermissionedRouter
from src.auth.dependencies import tiene_permiso_operar
from src.direcciones_cliente import schemas, services

router = PermissionedRouter(prefix="/direcciones-cliente", tags=["direcciones-cliente"])


@router.get("/cliente/{cliente_id}", response_model=List[schemas.DireccionCliente])
def get_direcciones_por_cliente(cliente_id: int, db: Session = Depends(get_db)):
    return services.listar_direcciones_por_cliente(db, cliente_id)


@router.get("/{direccion_id}", response_model=schemas.DireccionCliente)
def get_direccion_cliente(direccion_id: int, db: Session = Depends(get_db)):
    return services.leer_direccion_cliente(db, direccion_id)


@router.post("/",response_model=schemas.DireccionCliente)
def create_direccion_cliente(
    datos: schemas.DireccionClienteCreate, db: Session = Depends(get_db)
):
    return services.crear_direccion_cliente(db, datos)


@router.put("/{direccion_id}",response_model=schemas.DireccionCliente)
def update_direccion_cliente(direccion_id: int, datos: schemas.DireccionClienteUpdate, db: Session = Depends(get_db)):
    return services.modificar_direccion_cliente(db, direccion_id, datos)


@router.patch("/{direccion_id}/estado",response_model=schemas.DireccionCliente)
def cambiar_estado_direccion_cliente(direccion_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_direccion_cliente(db, direccion_id)