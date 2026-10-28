"""
Pobla la base de datos con lotes de producción de prueba.
Uso: python -m scripts.seed_lote_produccion
"""
from datetime import date, timedelta
from random import Random
from sqlalchemy import select

from src.database import SessionLocal
from src.producto.models import Producto
from src.lote_produccion.models import LoteProduccion

DIAS_HISTORICO = 30
MAX_PRODUCTOS = 5


def generar_lotes_produccion(db) -> list[LoteProduccion]:
    fake = Random(42)

    productos = db.scalars(
        select(Producto).where(Producto.activo == True).limit(MAX_PRODUCTOS)
    ).all()

    lotes = []

    for producto in productos:
        for dias_atras in range(DIAS_HISTORICO):
            fecha = date.today() - timedelta(days=dias_atras)

            if dias_atras % 7 == 0:
                continue

            existe = db.scalar(
                select(LoteProduccion.id).where(
                    LoteProduccion.producto_id == producto.id,
                    LoteProduccion.fecha_produccion == fecha
                )
            )

            if existe is not None:
                continue

            for numero in range(fake.randint(1, 3)):
                lotes.append(
                    LoteProduccion(
                        producto_id=producto.id,
                        fecha_produccion=fecha,
                        fecha_vencimiento=fecha + timedelta(days=30),
                        cantidad_producida=fake.randint(20, 150),
                        activo=not (dias_atras % 11 == 0 and numero == 0)
                    )
                )

    return lotes


def main():
    db = SessionLocal()
    try:
        lotes = generar_lotes_produccion(db)

        db.add_all(lotes)
        db.commit()

        inactivos = sum(1 for lote in lotes if not lote.activo)
        print(f"Se insertaron {len(lotes)} lotes de producción ({inactivos} inactivos).")

        if not lotes:
            print("No se generaron lotes nuevos. Verificá que existan productos activos.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
