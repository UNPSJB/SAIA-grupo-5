import logging
from datetime import date, timedelta
from typing import List
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from src.elementosLimpieza.models import ElementoLimpieza, TipoElementoLimpieza
from src.elementosLimpieza import schemas, exceptions
from src.recambiosElementosLimpieza.models import RecambioElementoLimpieza

logger = logging.getLogger(__name__)

""" Services para el tipo de elemento limpieza """
def crear_tipo_elemento_limpieza(db: Session, tipo: schemas.TipoElementoLimpiezaCreate) -> schemas.TipoElementoLimpieza:
    prefijo = tipo.prefijo.strip().upper()

    tipo_existente = db.scalars(
        select(TipoElementoLimpieza)
        .where(TipoElementoLimpieza.nombre == tipo.nombre)
    ).first()

    if tipo_existente:
        raise exceptions.TipoElementoLimpiezaDuplicado()

    prefijo_existente = db.scalars(
        select(TipoElementoLimpieza)
        .where(TipoElementoLimpieza.prefijo == prefijo)
    ).first()

    if prefijo_existente:
        raise exceptions.PrefijoTipoElementoLimpiezaDuplicado()

    _tipo = TipoElementoLimpieza(
        nombre=tipo.nombre,
        prefijo=prefijo
    )

    db.add(_tipo)
    db.commit()
    db.refresh(_tipo)

    return _tipo


def listar_tipos_elemento_limpieza(db: Session) -> List[schemas.TipoElementoLimpieza]:
    return db.scalars(select(TipoElementoLimpieza)).all()


def leer_tipo_elemento_limpieza(db: Session, tipo_id: int) -> schemas.TipoElementoLimpieza:
    db_tipo = db.scalar(
        select(TipoElementoLimpieza)
        .where(TipoElementoLimpieza.id == tipo_id)
    )

    if db_tipo is None:
        raise exceptions.TipoElementoLimpiezaNoEncontrado()

    return db_tipo


def modificar_tipo_elemento_limpieza(db: Session, tipo_id: int, tipo: schemas.TipoElementoLimpiezaUpdate) -> TipoElementoLimpieza:
    db_tipo = leer_tipo_elemento_limpieza(db, tipo_id)

    db.execute(
        update(TipoElementoLimpieza)
        .where(TipoElementoLimpieza.id == tipo_id)
        .values(**tipo.model_dump(exclude_unset=True))
    )

    db.commit()
    db.refresh(db_tipo)

    return db_tipo


def eliminar_tipo_elemento_limpieza(db: Session, tipo_id: int) -> schemas.TipoElementoLimpieza:
    db_tipo = leer_tipo_elemento_limpieza(db, tipo_id)

    elemento_activo = db.scalars(
        select(ElementoLimpieza.id)
        .where(
            ElementoLimpieza.tipo_id == tipo_id,
            ElementoLimpieza.estado == True
        )
    ).first()

    if elemento_activo:
        raise exceptions.TipoElementoLimpiezaEnUso()

    db.execute(
        update(TipoElementoLimpieza)
        .where(TipoElementoLimpieza.id == tipo_id)
        .values(estado=False)
    )

    db.commit()
    db.refresh(db_tipo)

    return db_tipo


""" Services para elemento limpieza """

def calcular_dias_restantes(db: Session, elemento: ElementoLimpieza) -> int | None:
    if elemento.frecuencia_recambio is None:
        return None

    ultimo_recambio = db.scalar(
        select(RecambioElementoLimpieza)
        .where(RecambioElementoLimpieza.elemento_id == elemento.id)
        .order_by(RecambioElementoLimpieza.fecha.desc())
    )

    fecha_base = ultimo_recambio.fecha if ultimo_recambio else elemento.fecha_alta
    fecha_recambio = fecha_base + timedelta(days=elemento.frecuencia_recambio)

    return (fecha_recambio - date.today()).days


def crear_elemento_limpieza(db: Session, elemento: schemas.ElementoLimpiezaCreate) -> schemas.ElementoLimpieza:
    tipo = db.scalar(
        select(TipoElementoLimpieza)
        .where(TipoElementoLimpieza.id == elemento.tipo_id,
               TipoElementoLimpieza.estado == True)
    )

    if tipo is None:
        raise exceptions.TipoElementoLimpiezaNoEncontrado()

    ultimo_codigo = db.scalar(
        select(ElementoLimpieza.codigo)
        .where(ElementoLimpieza.tipo_id == elemento.tipo_id)
        .order_by(ElementoLimpieza.codigo.desc())
    )

    if ultimo_codigo:
        ultimo_numero = int(ultimo_codigo.split("-")[-1])
        siguiente_numero = ultimo_numero + 1
    else:
        siguiente_numero = 1

    codigo = f"{tipo.prefijo}-{siguiente_numero:03d}"

    _elemento = ElementoLimpieza(
        **elemento.model_dump(),
        codigo=codigo
    )

    db.add(_elemento)
    db.commit()
    db.refresh(_elemento)

    return _elemento

def listar_elementos_limpieza(db: Session) -> List[schemas.ElementoLimpieza]:
    elementos = db.scalars(select(ElementoLimpieza)).all()

    resultado = []

    for elemento in elementos:
        elemento_schema = schemas.ElementoLimpieza.model_validate(elemento)
        elemento_schema.dias_restantes = calcular_dias_restantes(db, elemento)
        resultado.append(elemento_schema)

    return resultado

def leer_elemento_limpieza(db: Session, elemento_id: int) -> schemas.ElementoLimpieza:
    db_elemento = db.scalar(select(ElementoLimpieza).where(ElementoLimpieza.id == elemento_id))

    if db_elemento is None:
        raise exceptions.ElementoLimpiezaNoEncontrado()

    return db_elemento

def modificar_elemento_limpieza(db: Session, elemento_id: int, elemento: schemas.ElementoLimpiezaUpdate) -> ElementoLimpieza:
    db_elemento = leer_elemento_limpieza(db, elemento_id)

    db.execute(
        update(ElementoLimpieza)
        .where(ElementoLimpieza.id == elemento_id)
        .values(**elemento.model_dump(exclude_unset=True))
    )

    db.commit()
    db.refresh(db_elemento)

    logger.info(
        f"Se actualizo correctamente el elemento de limpieza: "
        f"{db_elemento.nombre}"
    )

    return db_elemento

def eliminar_elemento_limpieza(db: Session, elemento_id: int) -> schemas.ElementoLimpieza:
    db_elemento = leer_elemento_limpieza(db, elemento_id)

    db.execute(
        update(ElementoLimpieza)
        .where(ElementoLimpieza.id == db_elemento.id)
        .values(estado=False)
    )

    db.commit()
    db.refresh(db_elemento)

    return db_elemento

