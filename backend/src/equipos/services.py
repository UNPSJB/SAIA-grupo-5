import logging
from typing import List
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session, joinedload
from src.equipos.models import Equipo
from src.equipos import schemas, exceptions
from src.insumos.models import Insumo
from src.insumos_lote.models import InsumoLote
from src.lote_produccion.models import LoteProduccion

logger = logging.getLogger(__name__)

def crear_equipo(db: Session, equipo: schemas.EquipoCreate) -> schemas.Equipo:
    equipo_existente = db.scalars(select(Equipo).where(Equipo.nombre == equipo.nombre, Equipo.categoria == equipo.categoria, Equipo.ubicacion == equipo.ubicacion)).first()

    if equipo_existente:
        raise exceptions.EquipoDuplicado()

    _equipo = Equipo(**equipo.model_dump())
    db.add(_equipo)
    db.commit()
    db.refresh(_equipo)
    return _equipo

def listar_equipos(db:Session) -> List[schemas.Equipo]:
    return db.scalars(
        select(Equipo).options(joinedload(Equipo.sector))
    ).all()

def leer_equipo(db: Session, equipo_id: int) -> schemas.Equipo:
    db_equipo = db.scalar(select(Equipo).where(Equipo.id == equipo_id))
    if db_equipo is None:
        raise exceptions.EquipoNoEncontrado()
    return db_equipo

def modificar_equipo(db: Session, equipo_id: int, equipo: schemas.EquipoUpdate) -> Equipo:
    db_equipo = leer_equipo(db, equipo_id)
    if not db_equipo.estado:
        raise exceptions.EquipoDadoDeBaja()

    cambios = equipo.model_dump(exclude_unset=True)
    controla_final = cambios.get("controla_temperatura", db_equipo.controla_temperatura)
    min_final = cambios.get("temperatura_minima", db_equipo.temperatura_minima)
    max_final = cambios.get("temperatura_maxima", db_equipo.temperatura_maxima)

    if controla_final:
        if min_final is None or max_final is None:
            raise exceptions.RangoTemperaturaIncompleto()
        if min_final >= max_final:
            raise exceptions.RangoTemperaturaInvalido()
    else:
        cambios["temperatura_minima"] = None
        cambios["temperatura_maxima"] = None

    db.execute(
        update(Equipo)
        .where(Equipo.id == equipo_id)
        .values(**cambios)
    )
    db.commit()
    db.refresh(db_equipo)
    logger.info(
        f"Se actualizo correctamente el equipo: "
        f"{db_equipo.nombre}"
    )
    return db_equipo


def obtener_almacenamiento_equipo(db: Session, equipo_id: int) -> schemas.AlmacenamientoEquipoResponse:
    leer_equipo(db, equipo_id)

    insumos_lote = db.scalars(
        select(InsumoLote)
        .where(
            InsumoLote.equipo_id == equipo_id,
            InsumoLote.activo == True,
            InsumoLote.cantidad_restante > 0,
        )
        .options(joinedload(InsumoLote.insumo).joinedload(Insumo.unidad_medida))
    ).all()

    lotes_produccion = db.scalars(
        select(LoteProduccion)
        .where(
            LoteProduccion.equipo_id == equipo_id,
            LoteProduccion.activo == True,
            LoteProduccion.cantidad_disponible > 0,
        )
        .options(joinedload(LoteProduccion.producto))
    ).all()

    insumos_resumen = [
        schemas.InsumoAlmacenadoResumen(
            id=insumo_lote.id,
            insumo_nombre=insumo_lote.insumo.nombre if insumo_lote.insumo else "Insumo",
            marca=insumo_lote.marca,
            numero_lote=insumo_lote.numero_lote,
            cantidad_restante=insumo_lote.cantidad_restante,
            unidad_medida=(
                insumo_lote.insumo.unidad_medida.nombre
                if insumo_lote.insumo and insumo_lote.insumo.unidad_medida
                else "Unidades"
            ),
            fecha_vencimiento=insumo_lote.fecha_vencimiento,
        )
        for insumo_lote in insumos_lote
    ]

    lotes_resumen = [
        schemas.LoteAlmacenadoResumen(
            id=lote.id,
            producto_nombre=lote.producto.nombre if lote.producto else "Producto",
            cantidad_disponible=lote.cantidad_disponible,
            estado=lote.estado,
            fecha_produccion=lote.fecha_produccion,
            fecha_vencimiento=lote.fecha_vencimiento,
        )
        for lote in lotes_produccion
    ]

    return schemas.AlmacenamientoEquipoResponse(
        insumos=insumos_resumen,
        lotes_produccion=lotes_resumen,
    )

def eliminar_equipo(db: Session, equipo_id: int) -> schemas.Equipo:
    db_equipo = leer_equipo(db, equipo_id)
    db.execute(
        update(Equipo)
        .where(Equipo.id == db_equipo.id)
        .values(estado=False)
    )
    db.commit()
    db.refresh(db_equipo)
    return db_equipo

