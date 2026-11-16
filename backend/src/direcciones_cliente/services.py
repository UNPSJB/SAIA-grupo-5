from typing import List
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from src.direcciones_cliente.models import DireccionCliente
from src.direcciones_cliente import schemas, exceptions
from src.clientes.models import Cliente
from src.clientes.exceptions import ClienteNoEncontrado
from src.direcciones_cliente.schemas import DireccionClienteDelete


def leer_direccion_cliente(db: Session, direccion_id: int) -> schemas.DireccionCliente:
    direccion = db.scalars(select(DireccionCliente).where(DireccionCliente.id == direccion_id)).first()
    if direccion is None:
        raise exceptions.DireccionClienteNoEncontrada()
    return direccion


def listar_direcciones_por_cliente(db: Session, cliente_id: int) -> List[schemas.DireccionCliente]:
    cliente = db.scalars(select(Cliente).where(Cliente.id == cliente_id)).first()
    if cliente is None:
        raise ClienteNoEncontrado()
    return db.scalars(select(DireccionCliente).where(DireccionCliente.cliente_id == cliente_id)).all()


def crear_direccion_cliente(db: Session, datos: schemas.DireccionClienteCreate) -> schemas.DireccionCliente:
    cliente = db.scalars(select(Cliente).where(Cliente.id == datos.cliente_id)).first()
    if cliente is None:
        raise ClienteNoEncontrado()
    if not cliente.activo:
        raise exceptions.ClienteInactivo()

    direccion = DireccionCliente(**datos.model_dump())
    db.add(direccion)
    db.commit()
    db.refresh(direccion)
    return direccion


def modificar_direccion_cliente(db: Session, direccion_id: int, datos: schemas.DireccionClienteUpdate) -> schemas.DireccionCliente:
    direccion = leer_direccion_cliente(db, direccion_id)
    if not direccion.activo:
        raise exceptions.DireccionClienteDadoDeBaja()

    for key, value in datos.model_dump().items():
        setattr(direccion, key, value)

    db.commit()
    db.refresh(direccion)
    return direccion


def eliminar_direccion_cliente(db: Session, direccion_id: int) -> DireccionClienteDelete:
    direccion = leer_direccion_cliente(db, direccion_id)

    db.execute(delete(DireccionCliente).where(DireccionCliente.id == direccion_id))
    db.commit()
    return direccion