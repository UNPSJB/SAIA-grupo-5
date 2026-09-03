from typing import List
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from src.clientes.models import Cliente
from src.clientes import schemas


def crear_cliente(db: Session, cliente: schemas.ClienteCreate) -> schemas.Cliente:
    cliente_existente = db.scalar(
        select(Cliente).where(Cliente.dni == cliente.dni)
    )

    if cliente_existente is not None:
        raise ValueError("El cliente ya se encuentra registrado")

    _cliente = Cliente(**cliente.model_dump())
    db.add(_cliente)
    db.commit()
    db.refresh(_cliente)
    return _cliente


def listar_clientes(
    db: Session,
    nombre: str | None = None,
    apellido: str | None = None,
    dni: int | None = None
) -> List[schemas.Cliente]:

    consulta = select(Cliente)

    if nombre:
        consulta = consulta.where(
            Cliente.nombre.contains(nombre)
        )

    if apellido:
        consulta = consulta.where(
            Cliente.apellido.contains(apellido)
        )

    if dni is not None:
        consulta = consulta.where(
            Cliente.dni == dni
        )

    return db.scalars(consulta).all()


def leer_cliente(cliente_id: int, db: Session) -> schemas.Cliente:
    db_cliente = db.scalar(
        select(Cliente).where(Cliente.id == cliente_id)
    )

    if db_cliente is None:
        raise ValueError("Cliente no encontrado")

    return db_cliente


def modificar_cliente(db: Session, cliente_id: int, cliente: schemas.ClienteUpdate) -> Cliente:
    db_cliente = leer_cliente(cliente_id, db)

    if cliente.dni is not None:
        cliente_existente = db.scalar(
            select(Cliente).where(
                Cliente.dni == cliente.dni,
                Cliente.id != cliente_id,
                Cliente.activo == True
            )
        )

        if cliente_existente is not None:
            raise ValueError("El DNI ya se encuentra en uso")

    db.execute(
        update(Cliente)
        .where(Cliente.id == cliente_id)
        .values(**cliente.model_dump(exclude_unset=True))
    )
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


def eliminar_cliente(db: Session, cliente_id: int) -> Cliente:
    db_cliente = leer_cliente(cliente_id, db)

    if not db_cliente.activo:
        raise ValueError("El cliente ya se encuentra dado de baja")

    db.execute(
        update(Cliente)
        .where(Cliente.id == cliente_id)
        .values(activo=False)
    )

    db.commit()
    db.refresh(db_cliente)

    return db_cliente