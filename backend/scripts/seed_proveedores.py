"""
Pobla la base de datos con proveedores y su catálogo de insumos (ProveedorInsumo).
Requiere: seed_insumos.
Uso: python -m scripts.seed_proveedores
"""
from datetime import date, timedelta
from random import Random

from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.insumos.models import Insumo
from src.proveedor.models import Proveedor, ProveedorInsumo

INSUMOS_POR_PROVEEDOR = (4, 8)

# (nombre, cuit, telefono, email, dias hasta vencimiento de habilitación | None = sin habilitación)
PROVEEDORES = [
    ("Lácteos del Valle S.A.", "30-71234567-1", "0280-4451234", "ventas@lacteosdelvalle.com", 240),
    ("Molinos Patagónicos S.R.L.", "30-70987654-2", "0280-4467788", "pedidos@molinospatagonicos.com", 180),
    ("Distribuidora Chubut", "30-69876543-3", "0280-4423311", "contacto@distchubut.com", 365),
    ("Frutas y Verduras Don José", "20-25789456-4", "0280-4498765", "donjose@gmail.com", 90),
    ("Insumos Gastronómicos Sur", "30-71555444-5", "0280-4412233", "info@igsur.com.ar", -20),  # vencida
    ("Granja La Esperanza", "20-30111222-6", "0280-4455667", None, None),  # sin habilitación
]


def generar_proveedores(db) -> list[Proveedor]:
    rnd = Random(42)
    hoy = date.today()

    insumos = db.scalars(select(Insumo).where(Insumo.activo == True)).all()  # noqa: E712
    if not insumos:
        return []

    existentes = set(db.scalars(select(Proveedor.cuit)).all())

    proveedores = []
    for nombre, cuit, telefono, email, dias_venc in PROVEEDORES:
        if cuit in existentes:
            continue

        con_habilitacion = dias_venc is not None
        proveedor = Proveedor(
            nombre=nombre,
            cuit=cuit,
            telefono=telefono,
            email=email,
            numero_habilitacion=f"RNE-{rnd.randint(10000, 99999)}" if con_habilitacion else None,
            vencimiento_habilitacion=hoy + timedelta(days=dias_venc) if con_habilitacion else None,
            observacion_habilitacion=None,
            activo=True,
        )

        cantidad = min(len(insumos), rnd.randint(*INSUMOS_POR_PROVEEDOR))
        proveedor.insumos_asociados = [
            ProveedorInsumo(insumo_id=insumo.id) for insumo in rnd.sample(insumos, cantidad)
        ]
        proveedores.append(proveedor)

    return proveedores


def main():
    db = SessionLocal()
    try:
        proveedores = generar_proveedores(db)
        db.add_all(proveedores)
        db.commit()

        asociaciones = sum(len(p.insumos_asociados) for p in proveedores)
        print(f"Se insertaron {len(proveedores)} proveedores con {asociaciones} insumos asociados.")
        if not proveedores:
            print("No se generaron proveedores nuevos (ya existen o no hay insumos activos).")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
