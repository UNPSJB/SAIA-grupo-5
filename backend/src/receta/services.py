import logging
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.receta.models import Receta
from src.receta import schemas, exceptions, orden
from src.etapa_receta.services import construir_etapa
from src.producto.services import leer_producto

logger = logging.getLogger(__name__)

# operaciones CRUD para Receta

# Receta + etapas + pasos se insertan en una sola transacción (un único commit)
def crear_receta(db: Session, receta: schemas.RecetaCreate) -> schemas.Receta:
    leer_producto(db, receta.producto_id)
    if _buscar_receta_de_producto(db, receta.producto_id) is not None:
        raise exceptions.RecetaDuplicada()

    db_receta = Receta(producto_id=receta.producto_id)
    for etapa in receta.etapas:
        orden.insertar(db_receta.etapas, construir_etapa(etapa.nombre, etapa.pasos))
    db.add(db_receta)
    db.commit()
    db.refresh(db_receta)
    return db_receta

def leer_receta(db: Session, receta_id: int) -> schemas.Receta:
    db_receta = db.get(Receta, receta_id)
    if db_receta is None:
        raise exceptions.RecetaNoEncontrada()
    return db_receta

def obtener_receta_de_producto(db: Session, producto_id: int) -> schemas.Receta:
    leer_producto(db, producto_id)
    db_receta = _buscar_receta_de_producto(db, producto_id)
    if db_receta is None:
        raise exceptions.RecetaNoEncontrada()
    return db_receta

def actualizar_receta(db: Session, receta_id: int, receta: schemas.RecetaUpdate) -> schemas.Receta:
    db_receta = leer_receta(db, receta_id)

    # delete-orphan borra las etapas (y sus pasos) que se reemplazan
    db_receta.etapas.clear()
    for etapa in receta.etapas:
        orden.insertar(db_receta.etapas, construir_etapa(etapa.nombre, etapa.pasos))
    db.commit()
    db.refresh(db_receta)
    return db_receta


# Único punto donde se busca la receta vigente de un producto:
# si se versiona la receta, acá se agrega el filtro por es_actual
def _buscar_receta_de_producto(db: Session, producto_id: int) -> Receta | None:
    return db.scalar(select(Receta).where(Receta.producto_id == producto_id))
