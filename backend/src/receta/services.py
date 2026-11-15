import logging
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.receta.models import Receta, InsumoReceta
from src.receta import schemas, exceptions, orden
from src.receta.constants import TipoRenglon
from src.receta.sellos import evaluar_sellos
from src.etapa_receta.services import construir_etapa
from src.producto.services import leer_producto
from src.insumos.models import Insumo
from src.insumos.exceptions import InsumoNoEncontrado
from src.aditivo.models import Aditivo
from src.unidad_medida.models import UnidadMedida

logger = logging.getLogger(__name__)

# operaciones CRUD para Receta

# Receta + etapas + pasos se insertan en una sola transacción (un único commit)
def crear_receta(db: Session, receta: schemas.RecetaCreate) -> schemas.Receta:
    leer_producto(db, receta.producto_id)
    if _buscar_receta_de_producto(db, receta.producto_id) is not None:
        raise exceptions.RecetaDuplicada()

    db_receta = _construir_version(db, receta, receta.producto_id, 1)
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

def listar_versiones_de_producto(db: Session, producto_id: int) -> list[schemas.RecetaVersion]:
    leer_producto(db, producto_id)
    return db.scalars(
        select(Receta).where(Receta.producto_id == producto_id).order_by(Receta.version.desc())
    ).all()

def actualizar_receta(db: Session, receta_id: int, receta: schemas.RecetaUpdate) -> schemas.Receta:
    db_anterior = leer_receta(db, receta_id)
    if not db_anterior.vigente:
        raise exceptions.RecetaSoloLectura()

    ultima_version = db.scalar(
        select(Receta.version).where(Receta.producto_id == db_anterior.producto_id).order_by(Receta.version.desc()).limit(1)
    )
    admitidos_inactivos = {item.insumo_id for item in db_anterior.insumos}
    aditivos_admitidos_inactivos = {item.aditivo_id for item in db_anterior.insumos if item.aditivo_id is not None}
    unidades_admitidas_inactivas = {db_anterior.rendimiento_unidad_medida_id, db_anterior.porcion_unidad_medida_id}
    db_nueva = _construir_version(
        db, receta, db_anterior.producto_id, ultima_version + 1,
        admitidos_inactivos, aditivos_admitidos_inactivos, unidades_admitidas_inactivas,
    )

    db_anterior.vigente = False
    db_anterior.fecha_hasta_vigencia = db_nueva.fecha_desde_vigencia
    db.flush()

    db.add(db_nueva)
    db.commit()
    db.refresh(db_nueva)
    return db_nueva

def evaluar_sellos_receta(db: Session, datos: schemas.EvaluacionSellosCreate) -> schemas.EvaluacionSellos:
    db_producto = leer_producto(db, datos.producto_id)
    insumos = _validar_insumos(db, datos.insumos, set(_insumos_ids_de_receta(db, datos.producto_id)))
    unidad_rendimiento = db.get(UnidadMedida, datos.rendimiento_unidad_medida_id) if datos.rendimiento_unidad_medida_id else None
    return evaluar_sellos(
        db_producto,
        [(insumos[item.insumo_id], item.cantidad) for item in datos.insumos],
        datos.rendimiento,
        unidad_rendimiento,
    )

def _insumos_ids_de_receta(db: Session, producto_id: int) -> list[int]:
    db_receta = _buscar_receta_de_producto(db, producto_id)
    if db_receta is None:
        return []
    return [item.insumo_id for item in db_receta.insumos]


def _construir_version(
    db: Session,
    receta: schemas.RecetaBase,
    producto_id: int,
    version: int,
    insumos_admitidos_inactivos: set[int] = frozenset(),
    aditivos_admitidos_inactivos: set[int] = frozenset(),
    unidades_admitidas_inactivas: set[int | None] = frozenset(),
) -> Receta:
    insumos = _validar_insumos(db, receta.insumos, insumos_admitidos_inactivos)
    aditivos = _validar_aditivos(db, receta.insumos, aditivos_admitidos_inactivos)
    _validar_unidad_medida(db, receta.rendimiento_unidad_medida_id, unidades_admitidas_inactivas)
    if receta.porcion_unidad_medida_id is not None:
        _validar_unidad_medida(db, receta.porcion_unidad_medida_id, unidades_admitidas_inactivas)

    db_receta = Receta(
        producto_id=producto_id,
        version=version,
        vigente=True,
        fecha_desde_vigencia=datetime.now(),
        rendimiento=receta.rendimiento,
        rendimiento_unidad_medida_id=receta.rendimiento_unidad_medida_id,
        porcion=receta.porcion,
        porcion_unidad_medida_id=receta.porcion_unidad_medida_id,
    )
    for etapa in receta.etapas:
        orden.insertar(db_receta.etapas, construir_etapa(etapa.nombre, etapa.pasos))
    for item in receta.insumos:
        db_receta.insumos.append(InsumoReceta(
            insumo=insumos[item.insumo_id],
            cantidad=item.cantidad,
            tipo=item.tipo.value,
            aditivo=aditivos.get(item.aditivo_id),
        ))
    return db_receta


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


def _validar_aditivos(db: Session, items: list[schemas.InsumoRecetaCreate], admitidos_inactivos: set[int] = frozenset()) -> dict[int, Aditivo]:
    ids = {item.aditivo_id for item in items if item.tipo == TipoRenglon.ADITIVO}
    aditivos = {aditivo.id: aditivo for aditivo in db.scalars(select(Aditivo).where(Aditivo.id.in_(ids))).all()}
    for aditivo_id in ids:
        aditivo = aditivos.get(aditivo_id)
        if aditivo is None or (not aditivo.activo and aditivo_id not in admitidos_inactivos):
            raise exceptions.AditivoNoDisponible()
    return aditivos


def _validar_unidad_medida(db: Session, unidad_medida_id: int, admitidas_inactivas: set[int | None] = frozenset()) -> None:
    unidad = db.get(UnidadMedida, unidad_medida_id)
    if unidad is None or (not unidad.activo and unidad_medida_id not in admitidas_inactivas):
        raise exceptions.UnidadMedidaNoDisponible()


def _buscar_receta_de_producto(db: Session, producto_id: int) -> Receta | None:
    return db.scalar(select(Receta).where(Receta.producto_id == producto_id, Receta.vigente.is_(True)))
