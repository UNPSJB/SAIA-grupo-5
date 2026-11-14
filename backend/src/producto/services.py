import logging
import re
from typing import List
from sqlalchemy import  select, update
from sqlalchemy.orm import Session, joinedload, selectinload
from src.producto.models import Producto
from src.producto import schemas, exceptions
from src.configuracion_sistema.models import ConfiguracionSistema
from src.configuracion_sistema.constants import ID_CONFIGURACION_SISTEMA

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

# Operaciones para generar los codigos de barra
def generar_digito_control(codigo12: str) -> int:
    suma_pares = 0
    suma_impares = 0

    for i, ch in enumerate(codigo12):
        dig = int(ch)
        pos = i + 1
        if pos % 2 == 1:
            suma_impares += dig
        else:
            suma_pares += dig

    total = suma_impares + (suma_pares * 3)
    digito_control = (10 - (total % 10)) % 10
    return digito_control


def generar_codigo_barras(prefijo_gs1: str, prefijo_empresa: str, producto_id: int) -> str:
    if producto_id < 1 or producto_id > 99999:
        raise ValueError("El ID del producto debe estar entre 1 y 99999.")
    
    codigo_producto = str(producto_id).zfill(5)
    codigo12 = prefijo_gs1 + prefijo_empresa + codigo_producto

    if not re.fullmatch(r"[0-9]{12}", codigo12):
        raise ValueError("El código de barras debe contener 12 dígitos numéricos.")

    digito_control = generar_digito_control(codigo12)
    return codigo12 + str(digito_control)


# operaciones CRUD para Productos

def crear_producto(db: Session, producto: schemas.ProductoCreate) -> schemas.Producto:
    producto_existente = db.scalars(select(Producto).where(Producto.nombre == producto.nombre)).first()

    if producto_existente:
        raise exceptions.ProductoDuplicado()

    _producto = Producto(**producto.model_dump())
    db.add(_producto)
    db.flush()

    configuracion = db.get(ConfiguracionSistema, ID_CONFIGURACION_SISTEMA)
    if configuracion and configuracion.prefijo_empresa:
        _producto.codigo_barras = generar_codigo_barras(
            configuracion.prefijo_gs1,
            configuracion.prefijo_empresa,
            _producto.id
        )

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