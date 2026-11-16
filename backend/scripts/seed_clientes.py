"""
Pobla la base de datos con clientes y sus direcciones de entrega.
Uso: python -m scripts.seed_clientes
"""
from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.clientes.models import Cliente
from src.direcciones_cliente.models import DireccionCliente

# (razon_social, cuit, telefono, email, activo, [(calle_altura, localidad, provincia, cp, descripcion)])
CLIENTES = [
    ("Supermercado La Anónima Trelew", "30-50673003-8", "0280-4420000", "compras.trelew@laanonima.com", True, [
        ("Av. Fontana 450", "Trelew", "Chubut", "9100", "Sucursal centro"),
        ("Belgrano 1200", "Trelew", "Chubut", "9100", "Depósito"),
    ]),
    ("Almacén El Progreso", "20-28456123-9", "0280-4433221", "elprogreso@gmail.com", True, [
        ("San Martín 875", "Rawson", "Chubut", "9103", None),
    ]),
    ("Despensa Doña Rosa", "27-31555888-2", "0280-4471122", None, True, [
        ("Gales 320", "Gaiman", "Chubut", "9105", None),
    ]),
    ("Autoservicio Puerto Madryn", "30-71122334-5", "0280-4459988", "pedidos@autoserviciopm.com", True, [
        ("Av. Roca 1500", "Puerto Madryn", "Chubut", "9120", "Local"),
        ("25 de Mayo 640", "Puerto Madryn", "Chubut", "9120", "Sucursal norte"),
    ]),
    ("Comedor Escolar N° 12", "30-99887766-1", "0280-4401234", "comedor12@chubut.edu.ar", True, [
        ("Rivadavia 210", "Trelew", "Chubut", "9100", "Ingreso por cocina"),
    ]),
    ("Kiosco Las Toscas", "20-35666777-3", None, None, False, [
        ("Moreno 55", "Rawson", "Chubut", "9103", None),
    ]),
]


def generar_clientes(db) -> list[Cliente]:
    existentes = set(db.scalars(select(Cliente.cuit)).all())

    return [
        Cliente(
            razon_social=razon_social,
            cuit=cuit,
            telefono=telefono,
            email=email,
            activo=activo,
            direcciones=[
                DireccionCliente(
                    calle_altura=calle,
                    localidad=localidad,
                    provincia=provincia,
                    codigo_postal=cp,
                    descripcion=descripcion,
                    activo=True,
                )
                for calle, localidad, provincia, cp, descripcion in direcciones
            ],
        )
        for razon_social, cuit, telefono, email, activo, direcciones in CLIENTES
        if cuit not in existentes
    ]


def main():
    db = SessionLocal()
    try:
        clientes = generar_clientes(db)
        db.add_all(clientes)
        db.commit()

        direcciones = sum(len(c.direcciones) for c in clientes)
        print(f"Se insertaron {len(clientes)} clientes con {direcciones} direcciones.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
