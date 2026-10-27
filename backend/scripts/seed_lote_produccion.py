
"""
Genera productos y lotes de producción para probar las estadísticas.

- Crea las unidades de medida si no existen.
- Crea 5 productos de ejemplo si no existen.
- Genera lotes durante los últimos 30 días.
- Genera entre 1 y 3 lotes por producto y día.
- Incluye días sin producción y algunos lotes inactivos.
- Evita volver a insertar registros idénticos.

Uso:
    python -m scripts.seed_lote_produccion

Ejecutar únicamente en una base de desarrollo.
"""

from datetime import date, timedelta
from random import Random

from sqlalchemy import select

import src.all_models  # noqa: F401

from src.database import SessionLocal
from src.unidad_medida.models import UnidadMedida
from src.producto.models import Producto
from src.lote_produccion.models import LoteProduccion


DIAS_HISTORICO = 30

PRODUCTOS = [
    ("Yogur natural", "Yogur elaborado con leche entera", 1000, "Mililitro"),
    ("Queso cremoso", "Queso cremoso fresco", 500, "Gramo"),
    ("Dulce de leche", "Dulce de leche tradicional", 400, "Gramo"),
    ("Leche entera", "Leche entera pasteurizada", 1000, "Mililitro"),
    ("Manteca", "Manteca tradicional", 200, "Gramo"),
]


def generar_unidades_medida(db):
    unidades = {}

    for nombre in {producto[3] for producto in PRODUCTOS}:
        unidad = db.scalar(
            select(UnidadMedida).where(UnidadMedida.nombre == nombre)
        )

        if unidad is None:
            unidad = UnidadMedida(nombre=nombre, activo=True)
            db.add(unidad)
            db.flush()

        unidades[nombre] = unidad

    return unidades


def generar_productos(db):
    unidades = generar_unidades_medida(db)
    productos = []

    for nombre, descripcion, cantidad_neta, unidad_nombre in PRODUCTOS:
        producto = db.scalar(
            select(Producto).where(Producto.nombre == nombre)
        )

        if producto is None:
            producto = Producto(
                nombre=nombre,
                descripcion=descripcion,
                cantidad_neta=cantidad_neta,
                unidad_medida_id=unidades[unidad_nombre].id,
                fecha_lanzamiento=date.today() - timedelta(days=365),
                activo=True
            )
            db.add(producto)
            db.flush()

        if producto.activo:
            productos.append(producto)

    return productos


def generar_lotes_produccion(db, productos):
    random = Random(42)
    hoy = date.today()
    lotes = []

    for indice_producto, producto in enumerate(productos):
        for dias_atras in range(DIAS_HISTORICO - 1, -1, -1):
            fecha_produccion = hoy - timedelta(days=dias_atras)

            # Dejamos algunos días sin producción.
            if dias_atras % 7 == 0:
                continue

            cantidad_lotes = random.randint(1, 3)

            for numero_lote in range(cantidad_lotes):
                cantidad = random.randint(20, 150) + indice_producto * 10
                fecha_vencimiento = fecha_produccion + timedelta(days=30)

                # Algunos lotes inactivos.
                activo = not (
                    dias_atras % 11 == 0 and numero_lote == 0
                )

                lote_existente = db.scalar(
                    select(LoteProduccion.id).where(
                        LoteProduccion.producto_id == producto.id,
                        LoteProduccion.fecha_produccion == fecha_produccion,
                        LoteProduccion.fecha_vencimiento == fecha_vencimiento,
                        LoteProduccion.cantidad_producida == cantidad,
                        LoteProduccion.activo == activo
                    )
                )

                if lote_existente is not None:
                    continue

                lote = LoteProduccion(
                    producto_id=producto.id,
                    fecha_produccion=fecha_produccion,
                    fecha_vencimiento=fecha_vencimiento,
                    cantidad_producida=cantidad,
                    activo=activo
                )

                lotes.append(lote)

    return lotes


def main():
    db = SessionLocal()

    try:
        productos = generar_productos(db)

        if not productos:
            print("No hay productos activos disponibles.")
            db.rollback()
            return

        lotes = generar_lotes_produccion(db, productos)

        db.add_all(lotes)
        db.commit()

        activos = sum(1 for lote in lotes if lote.activo)
        inactivos = len(lotes) - activos

        print(f"Productos disponibles: {len(productos)}")
        print(f"Lotes insertados: {len(lotes)}")
        print(f"Lotes activos: {activos}")
        print(f"Lotes inactivos: {inactivos}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
