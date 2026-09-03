from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import get_db
from src.clientes import schemas, services


router = APIRouter(
    prefix="/clientes",
    tags=["Clientes"]
)


@router.post("/", response_model=schemas.Cliente)
def crear_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(get_db)):
    try:
        return services.crear_cliente(db, cliente)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.get("/", response_model=List[schemas.Cliente])
def listar_clientes(
    nombre: str | None = None,
    apellido: str | None = None,
    dni: int | None = None,
    db: Session = Depends(get_db)
):
    return services.listar_clientes(db, nombre, apellido, dni)


@router.get("/{cliente_id}", response_model=schemas.Cliente)
def leer_cliente(cliente_id: int, db: Session = Depends(get_db)):
    try:
        return services.leer_cliente(cliente_id, db)

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


@router.put("/{cliente_id}", response_model=schemas.Cliente)
def modificar_cliente(cliente_id: int, cliente: schemas.ClienteUpdate, db: Session = Depends(get_db)):
    try:
        return services.modificar_cliente(
            db,
            cliente_id,
            cliente
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


@router.delete("/{cliente_id}", response_model=schemas.Cliente)
def eliminar_cliente(cliente_id: int, db: Session = Depends(get_db)):
    try:
        return services.eliminar_cliente(
            db,
            cliente_id
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )