import logging
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.rotulado import schemas, exceptions
from src.rotulado.constants import (
    MARCAS, MENSAJE_APLICA, MENSAJE_PENDIENTE, OBSERVACION_INICIAL, REGLAS_INICIALES, EstadoRotulado,
)
from src.rotulado.models import ReglasRotulado
from src.receta.models import Receta
from src.receta.schemas import EvaluacionSellosCreate
from src.receta.sellos import evaluar_sellos
from src.insumos.models import Insumo
from src.producto.services import leer_producto

if TYPE_CHECKING:
    from src.producto.models import Producto

logger = logging.getLogger(__name__)


def obtener_reglas_vigentes(db: Session) -> schemas.ReglasRotulado:
    reglas = db.scalar(select(ReglasRotulado).where(ReglasRotulado.vigente.is_(True)))
    if reglas is None:
        reglas = ReglasRotulado(version=1, vigente=True, fecha_desde_vigencia=datetime.now(),
                                observacion=OBSERVACION_INICIAL, **REGLAS_INICIALES)
        db.add(reglas)
        db.commit()
        db.refresh(reglas)
    return reglas

def listar_versiones_reglas(db: Session) -> list[schemas.ReglasRotulado]:
    obtener_reglas_vigentes(db)
    return db.scalars(select(ReglasRotulado).order_by(ReglasRotulado.version.desc())).all()

def leer_version_reglas(db: Session, reglas_id: int) -> schemas.ReglasRotulado:
    reglas = db.get(ReglasRotulado, reglas_id)
    if reglas is None:
        raise exceptions.ReglasNoEncontradas()
    return reglas

def crear_version_reglas(db: Session, datos: schemas.ReglasRotuladoCreate) -> schemas.ReglasRotulado:
    anterior = obtener_reglas_vigentes(db)
    ahora = datetime.now()

    anterior.vigente = False
    anterior.fecha_hasta_vigencia = ahora
    db.flush()

    nueva = ReglasRotulado(version=anterior.version + 1, vigente=True, fecha_desde_vigencia=ahora, **datos.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

def obtener_rotulado_producto(db: Session, producto_id: int) -> schemas.EvaluacionRotulado:
    db_producto = leer_producto(db, producto_id)
    return evaluar_rotulado(db, db_producto, _insumos_de_receta(db, producto_id))

def evaluar_rotulado_receta(db: Session, datos: EvaluacionSellosCreate) -> schemas.EvaluacionRotulado:
    producto = leer_producto(db, datos.producto_id)
    ids = [item.insumo_id for item in datos.insumos]
    insumos = {insumo.id: insumo for insumo in db.scalars(select(Insumo).where(Insumo.id.in_(ids))).all()}
    return evaluar_rotulado(db, producto, [(insumos[item.insumo_id], item.cantidad) for item in datos.insumos])

def actualizar_rotulado_producto(db: Session, producto_id: int, datos: schemas.RotuladoProductoUpdate) -> schemas.EvaluacionRotulado:
    db_producto = leer_producto(db, producto_id)
    for campo, valor in datos.model_dump().items():
        setattr(db_producto, campo, valor)
    db.commit()
    db.refresh(db_producto)
    return evaluar_rotulado(db, db_producto, _insumos_de_receta(db, producto_id))

def evaluar_rotulado(db: Session, producto: "Producto", insumos: list[tuple["Insumo", float]]) -> schemas.EvaluacionRotulado:
    reglas = obtener_reglas_vigentes(db)
    marcas = [_evaluar_marca(marca, producto, insumos, reglas) for marca in MARCAS]
    base = {
        "envasado_ausencia_cliente": producto.envasado_ausencia_cliente,
        "requiere_envasado_ausencia_cliente": reglas.requiere_envasado_ausencia_cliente,
        "marcas": marcas,
        "reglas_version": reglas.version,
    }

    if reglas.requiere_envasado_ausencia_cliente:
        if producto.envasado_ausencia_cliente is None:
            return schemas.EvaluacionRotulado(estado=EstadoRotulado.PENDIENTE, mensaje=MENSAJE_PENDIENTE, **base)
        if not producto.envasado_ausencia_cliente:
            return schemas.EvaluacionRotulado(estado=EstadoRotulado.NO_CORRESPONDE, mensaje=reglas.mensaje_no_corresponde, **base)

    activas = [marca for marca in marcas if marca.valor and marca.considerada]
    if not activas:
        return schemas.EvaluacionRotulado(estado=EstadoRotulado.EXCEPTUADO, mensaje=reglas.mensaje_exceptuado, **base)

    return schemas.EvaluacionRotulado(
        estado=EstadoRotulado.APLICA,
        mensaje=MENSAJE_APLICA.format(marcas=", ".join(marca.nombre.lower() for marca in activas)),
        sellos=evaluar_sellos(producto, insumos),
        **base,
    )


def _evaluar_marca(marca, producto: "Producto", insumos: list[tuple["Insumo", float]], reglas: ReglasRotulado) -> schemas.MarcaEvaluada:
    insumos_con_marca = [insumo.nombre for insumo, _ in insumos if getattr(insumo, marca.campo_insumo)]
    declarado = getattr(producto, marca.campo_producto)
    sugerido = bool(insumos_con_marca)
    return schemas.MarcaEvaluada(
        clave=marca.clave,
        nombre=marca.nombre,
        sugerido=sugerido,
        declarado=declarado,
        valor=sugerido if declarado is None else declarado,
        considerada=getattr(reglas, marca.campo_regla),
        insumos=insumos_con_marca,
    )


def _insumos_de_receta(db: Session, producto_id: int) -> list[tuple["Insumo", float]]:
    receta = db.scalar(select(Receta).where(Receta.producto_id == producto_id))
    if receta is None:
        return []
    return [(item.insumo, item.cantidad) for item in receta.insumos]
