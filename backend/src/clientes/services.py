from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from src.clientes.models import Cliente
from src.clientes import schemas, exceptions


def listar_clientes(db: Session) -> List[schemas.Cliente]:
    return db.scalars(select(Cliente).options(joinedload(Cliente.direcciones))).unique().all()


def leer_cliente(db: Session, cliente_id: int) -> schemas.Cliente:
    cliente = db.scalars(select(Cliente).where(Cliente.id == cliente_id).options(joinedload(Cliente.direcciones))).first()
    if cliente is None:
        raise exceptions.ClienteNoEncontrado()
    return cliente


def crear_cliente(db: Session, datos: schemas.ClienteCreate) -> schemas.Cliente:
    cuit_existente = db.scalars(select(Cliente).where(Cliente.cuit == datos.cuit)).first()
    if cuit_existente:
        raise exceptions.ClienteYaExisteCuit()

    cliente = Cliente(**datos.model_dump())
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return leer_cliente(db, cliente.id)


def modificar_cliente(
    db: Session, cliente_id: int, datos: schemas.ClienteUpdate) -> schemas.Cliente:
    cliente = leer_cliente(db, cliente_id)
    if not cliente.activo:
        raise exceptions.ClienteDadoDeBaja()

    cuit_existente = db.scalars(select(Cliente).where(Cliente.cuit == datos.cuit, Cliente.id != cliente_id)).first()
    if cuit_existente:
        raise exceptions.ClienteYaExisteCuit()

    for key, value in datos.model_dump().items():
        setattr(cliente, key, value)

    db.commit()
    db.refresh(cliente)
    return cliente


def cambiar_estado_cliente(db: Session, cliente_id: int) -> schemas.Cliente:
    cliente = leer_cliente(db, cliente_id)
    cliente.activo = not cliente.activo
    db.commit()
    db.refresh(cliente)
    return cliente