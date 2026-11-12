import logging
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.receta.models import Receta, InsumoReceta
from src.receta import schemas, exceptions, orden
from src.receta.sellos import evaluar_sellos
from src.etapa_receta.services import construir_etapa
from src.producto.services import leer_producto
from src.insumos.models import Insumo
from src.insumos.exceptions import InsumoNoEncontrado

logger = logging.getLogger(__name__)

# operaciones CRUD para Receta

# Receta + etapas + pasos se insertan en una sola transacción (un único commit)
def crear_receta(db: Session, receta: schemas.RecetaCreate) -> schemas.Receta:
    leer_producto(db, receta.producto_id)
    if _buscar_receta_de_producto(db, receta.producto_id) is not None:
        raise exceptions.RecetaDuplicada()

    insumos = _validar_insumos(db, receta.insumos)

    db_receta = Receta(producto_id=receta.producto_id)
    for etapa in receta.etapas:
        orden.insertar(db_receta.etapas, construir_etapa(etapa.nombre, etapa.pasos))
    for item in receta.insumos:
        db_receta.insumos.append(InsumoReceta(insumo=insumos[item.insumo_id], cantidad=item.cantidad))
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

    if receta.insumos is not None:
        actuales = {item.insumo_id: item for item in db_receta.insumos}
        insumos = _validar_insumos(db, receta.insumos, set(actuales))
        nuevos_ids = {item.insumo_id for item in receta.insumos}
        for item in list(db_receta.insumos):
            if item.insumo_id not in nuevos_ids:
                db_receta.insumos.remove(item)
        for item in receta.insumos:
            if item.insumo_id in actuales:
                actuales[item.insumo_id].cantidad = item.cantidad
            else:
                db_receta.insumos.append(InsumoReceta(insumo=insumos[item.insumo_id], cantidad=item.cantidad))

    # delete-orphan borra las etapas (y sus pasos) que se reemplazan
    db_receta.etapas.clear()
    for etapa in receta.etapas:
        orden.insertar(db_receta.etapas, construir_etapa(etapa.nombre, etapa.pasos))
    db.commit()
    db.refresh(db_receta)
    return db_receta

def evaluar_sellos_receta(db: Session, datos: schemas.EvaluacionSellosCreate) -> schemas.EvaluacionSellos:
    db_producto = leer_producto(db, datos.producto_id)
    insumos = _validar_insumos(db, datos.insumos, set(_insumos_ids_de_receta(db, datos.producto_id)))
    return evaluar_sellos(db_producto, [(insumos[item.insumo_id], item.cantidad) for item in datos.insumos])

def _insumos_ids_de_receta(db: Session, producto_id: int) -> list[int]:
    db_receta = _buscar_receta_de_producto(db, producto_id)
    if db_receta is None:
        return []
    return [item.insumo_id for item in db_receta.insumos]


def _validar_insumos(db: Session, items: list[schemas.InsumoRecetaCreate], admitidos_inactivos: set[int] = frozenset()) -> dict[int, Insumo]:
    ids = [item.insumo_id for item in items]
    if len(ids) != len(set(ids)):
        raise exceptions.InsumoRepetido()

    insumos = {insumo.id: insumo for insumo in db.scalars(select(Insumo).where(Insumo.id.in_(ids))).all()}
    for insumo_id in ids:
        insumo = insumos.get(insumo_id)
        if insumo is None:
            raise InsumoNoEncontrado()
        if insumo.tipo_herencia != "general" or (not insumo.activo and insumo_id not in admitidos_inactivos):
            raise exceptions.InsumoNoAlimentario()
    return insumos


# Único punto donde se busca la receta vigente de un producto:
# si se versiona la receta, acá se agrega el filtro por es_actual
def _buscar_receta_de_producto(db: Session, producto_id: int) -> Receta | None:
    return db.scalar(select(Receta).where(Receta.producto_id == producto_id))
