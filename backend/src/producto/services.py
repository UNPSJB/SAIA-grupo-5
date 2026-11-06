import logging
from typing import List
from sqlalchemy import  select, update
from sqlalchemy.orm import Session, joinedload, selectinload
from src.producto.models import Producto
from src.producto import schemas, exceptions

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

# operaciones CRUD para Insumos

def crear_producto(db: Session, producto: schemas.ProductoCreate) -> schemas.Producto:
    producto_existente = db.scalars(select(Producto).where(Producto.nombre == producto.nombre)).first()

    if producto_existente:
        raise exceptions.ProductoDuplicado()


    _producto = Producto(**producto.model_dump())
    db.add(_producto)
    db.commit()
    db.refresh(_producto)
    return _producto

def listar_productos(db: Session) -> List[schemas.Producto]:
    return db.scalars(select(Producto).options(joinedload(Producto.unidad_medida), selectinload(Producto.receta))).all()

def leer_producto(db: Session, producto_id: int) -> schemas.Producto:
    db_producto = db.scalar(select(Producto).where(Producto.id == producto_id).options(joinedload(Producto.unidad_medida)))
    if db_producto is None:
        raise exceptions.ProductoNoEncontrado()
    return db_producto

def cambiar_estado_producto(db: Session, producto_id: int) -> schemas.Producto:
    db_producto = leer_producto(db, producto_id)

    if not db_producto.activo and not db_producto.unidad_medida.activo:
        raise exceptions.UnidadMedidaDadaDeBaja()

    db_producto.activo = not db_producto.activo
    db.commit()
    db.refresh(db_producto)
    return db_producto

def modificar_producto(db: Session, producto_id: int, producto: schemas.ProductoUpdate) -> schemas.Producto:  # Permite modificar el insumo pero si o si se tienen que enviar todos los campos
    db_producto = leer_producto(db, producto_id)
    if not db_producto.activo:
        raise exceptions.ProductoDadoDeBaja()

    producto_existente = db.scalars(select(Producto).where(Producto.nombre == producto.nombre,
                                    Producto.id != producto_id)).first()
    if producto_existente:
        raise exceptions.ProductoDuplicado()
    
    producto_actualizado = producto.model_dump()
    for key, value in producto_actualizado.items():
        setattr(db_producto, key, value)

    db.commit()
    db.refresh(db_producto)
    return db_producto