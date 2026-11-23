"""
Pobla la base de datos con lotes de producción de prueba, incluyendo:
  - estado según antigüedad (En produccion -> Empaquetando -> Terminado),
  - historial de estados (HistorialEstadoLote) con un hito por etapa,
  - receta con la que se elaboró (la versión vigente en la fecha de producción),
  - insumos utilizados (InsumoUtilizado) tomados de los InsumoLote acomodados
    que figuran en esa versión de la receta, descontando stock.
Solo genera lotes de productos que tienen receta. A los lotes que ya existían
sin receta les asigna la que corresponde a su fecha.
Requiere: seed_productos, seed_recetas, seed_personal y, para la trazabilidad
de insumos, seed_lotes_proveedor.
Uso: python -m scripts.seed_lote_produccion
"""
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from random import Random

from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.insumos_lote.models import InsumoLote
from src.lote_produccion.models import (
    EstadoLote,
    HistorialEstadoLote,
    InsumoUtilizado,
    LoteProduccion,
)
from src.lote_produccion.receta_lote import buscar_receta_para_lote
from src.lote_proveedor.constants import EstadoLoteProveedor
from src.lote_proveedor.models import LoteProveedor
from src.personal.models import Persona
from src.producto.models import Producto
from src.receta.models import InsumoReceta, Receta

DIAS_HISTORICO = 30
MAX_PRODUCTOS = 6
DIAS_MINIMOS_VENCIMIENTO_INSUMO = 15  # misma regla que validar_insumos_lote

ETAPAS = [
    (EstadoLote.EN_PRODUCCION.value, 0),
    (EstadoLote.EMPAQUETANDO.value, 4),
    (EstadoLote.TERMINADO.value, 8),
]


def _usuario(db) -> Persona | None:
    return (
        db.scalar(select(Persona).where(Persona.operar == True, Persona.activo == True))  # noqa: E712
        or db.scalar(select(Persona).where(Persona.activo == True))  # noqa: E712
    )


def _productos_con_receta(db) -> list[Producto]:
    return db.scalars(
        select(Producto)
        .where(
            Producto.activo == True,  # noqa: E712
            select(Receta.id).where(Receta.producto_id == Producto.id, Receta.vigente == True).exists(),  # noqa: E712
        )
        .order_by(Producto.id)
        .limit(MAX_PRODUCTOS)
    ).all()


def _insumos_por_receta(db) -> dict[int, list[int]]:
    """receta_id -> ids de insumos de esa versión de la receta."""
    resultado: dict[int, list[int]] = {}
    for receta_id, insumo_id in db.execute(select(InsumoReceta.receta_id, InsumoReceta.insumo_id)).all():
        resultado.setdefault(receta_id, []).append(insumo_id)
    return resultado


def asignar_recetas_a_lotes_existentes(db) -> int:
    """Completa la receta de los lotes que se cargaron antes de registrarla."""
    lotes = db.scalars(select(LoteProduccion).where(LoteProduccion.receta_id.is_(None))).all()
    asignados = 0
    for lote in lotes:
        receta = buscar_receta_para_lote(db, lote.producto_id, lote.fecha_produccion)
        if receta is not None:
            lote.receta_id = receta.id
            asignados += 1
    return asignados


def _stock_disponible(db) -> dict[int, list[tuple[InsumoLote, date]]]:
    """insumo_id -> [(InsumoLote, fecha_recepcion)] de lotes de proveedor ya acomodados."""
    filas = db.execute(
        select(InsumoLote, LoteProveedor.fecha_recepcion)
        .join(LoteProveedor, LoteProveedor.id == InsumoLote.lote_proveedor_id)
        .where(
            InsumoLote.activo == True,  # noqa: E712
            InsumoLote.cantidad_restante > 0,
            LoteProveedor.activo == True,  # noqa: E712
            LoteProveedor.estado == EstadoLoteProveedor.ACOMODADO,
        )
        .order_by(LoteProveedor.fecha_recepcion)
    ).all()
    stock: dict[int, list[tuple[InsumoLote, date]]] = {}
    for insumo_lote, fecha_recepcion in filas:
        stock.setdefault(insumo_lote.insumo_id, []).append((insumo_lote, fecha_recepcion))
    return stock


def _consumir_insumos(rnd, insumo_ids, stock, fecha) -> list[InsumoUtilizado]:
    """Toma, para cada insumo de la receta, el lote más antiguo (FIFO) disponible en esa fecha."""
    utilizados = []
    for insumo_id in insumo_ids:
        for insumo_lote, fecha_recepcion in stock.get(insumo_id, []):
            if (
                fecha_recepcion > fecha
                or insumo_lote.cantidad_restante <= 0
                or (insumo_lote.fecha_vencimiento - fecha).days < DIAS_MINIMOS_VENCIMIENTO_INSUMO
            ):
                continue
            cantidad = min(insumo_lote.cantidad_restante, rnd.randint(1, 5))
            insumo_lote.cantidad_restante -= cantidad
            if insumo_lote.cantidad_restante == 0:
                insumo_lote.activo = False
            utilizados.append(
                InsumoUtilizado(insumo_lote=insumo_lote, cantidad_utilizada=Decimal(cantidad))
            )
            break
    return utilizados


def generar_lotes_produccion(db) -> list[LoteProduccion]:
    rnd = Random(42)
    hoy = date.today()

    usuario = _usuario(db)
    productos = _productos_con_receta(db)
    if not productos:
        return []

    insumos_receta = _insumos_por_receta(db)
    stock = _stock_disponible(db)

    lotes = []
    # Del más antiguo al más reciente, para que el consumo de stock sea cronológico.
    for dias_atras in range(DIAS_HISTORICO - 1, -1, -1):
        fecha = hoy - timedelta(days=dias_atras)
        if dias_atras % 7 == 0 and dias_atras != 0:
            continue

        # Hoy -> en producción, ayer -> empaquetando, antes -> terminado.
        etapas = ETAPAS[: min(dias_atras, 2) + 1]

        for producto in productos:
            existe = db.scalar(
                select(LoteProduccion.id).where(
                    LoteProduccion.producto_id == producto.id,
                    LoteProduccion.fecha_produccion == fecha,
                )
            )
            if existe is not None:
                continue

            receta = buscar_receta_para_lote(db, producto.id, fecha)
            for numero in range(rnd.randint(1, 3)):
                cantidad = rnd.randint(20, 150)
                inicio = datetime.combine(fecha, time(6 + numero * 3, 0))

                lote = LoteProduccion(
                    producto_id=producto.id,
                    receta_id=receta.id,
                    fecha_produccion=fecha,
                    fecha_vencimiento=fecha + timedelta(days=30),
                    cantidad_producida=cantidad,
                    cantidad_disponible=cantidad,
                    estado=etapas[-1][0],
                    activo=not (dias_atras % 11 == 0 and numero == 0),
                    insumos_utilizados=_consumir_insumos(
                        rnd, insumos_receta.get(receta.id, []), stock, fecha
                    ),
                )
                if usuario is not None:
                    lote.historial_estados = [
                        HistorialEstadoLote(
                            estado=estado,
                            fecha_hora=inicio + timedelta(hours=horas),
                            usuario_id=usuario.id,
                            observacion="Alta del lote" if horas == 0 else None,
                        )
                        for estado, horas in etapas
                    ]
                lotes.append(lote)

    return lotes


def main():
    db = SessionLocal()
    try:
        asignados = asignar_recetas_a_lotes_existentes(db)
        lotes = generar_lotes_produccion(db)
        db.add_all(lotes)
        db.commit()

        if asignados:
            print(f"Se asignó la receta a {asignados} lotes de producción existentes.")

        inactivos = sum(1 for lote in lotes if not lote.activo)
        terminados = sum(1 for lote in lotes if lote.estado == EstadoLote.TERMINADO.value)
        con_trazabilidad = sum(1 for lote in lotes if lote.insumos_utilizados)
        print(
            f"Se insertaron {len(lotes)} lotes de producción ({terminados} terminados, "
            f"{inactivos} inactivos, {con_trazabilidad} con insumos utilizados)."
        )
        if not lotes:
            print("No se generaron lotes nuevos (ya existen para esas fechas o no hay productos activos con receta).")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
