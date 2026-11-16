"""
Pobla la base de datos con pedidos a proveedores (PedidoProveedor + items).
Solo genera pedidos para proveedores con habilitación vigente, igual que el service.
Los pedidos quedan en PENDIENTE; seed_lotes_proveedor marca como RECIBIDOS los
que tengan un lote de proveedor asociado.
Requiere: seed_personal, seed_proveedores.
Uso: python -m scripts.seed_pedidos_proveedor
"""
from datetime import date, datetime, time, timedelta
from random import Random

from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.personal.models import Persona
from src.proveedor.models import Proveedor
from src.pedidos_proveedor.models import PedidoProveedor, PedidoProveedorItem
from src.pedidos_proveedor.constants import EstadoPedidoProveedor

# Días hacia atrás en que se realizó cada pedido de un proveedor.
DIAS_PEDIDOS = [55, 40, 25, 12, 6, 2]


def usuario_registrador(db) -> Persona | None:
    return (
        db.scalar(select(Persona).where(Persona.administrar == True, Persona.activo == True))  # noqa: E712
        or db.scalar(select(Persona).where(Persona.activo == True))  # noqa: E712
    )


def generar_pedidos(db) -> list[PedidoProveedor]:
    rnd = Random(7)
    hoy = date.today()

    usuario = usuario_registrador(db)
    if usuario is None:
        return []

    proveedores = db.scalars(
        select(Proveedor).where(
            Proveedor.activo == True,  # noqa: E712
            Proveedor.vencimiento_habilitacion.is_not(None),
            Proveedor.vencimiento_habilitacion >= hoy,
        )
    ).all()

    con_pedidos = set(db.scalars(select(PedidoProveedor.proveedor_id).distinct()).all())

    pedidos = []
    for proveedor in proveedores:
        if proveedor.id in con_pedidos or not proveedor.insumos_asociados:
            continue

        catalogo = [asoc.insumo_id for asoc in proveedor.insumos_asociados]
        for dias in DIAS_PEDIDOS:
            fecha = hoy - timedelta(days=dias)
            cantidad_items = rnd.randint(2, min(4, len(catalogo))) if len(catalogo) >= 2 else 1
            pedidos.append(
                PedidoProveedor(
                    proveedor_id=proveedor.id,
                    registrado_por_id=usuario.id,
                    fecha_pedido=fecha,
                    fecha_entrega_estimada=fecha + timedelta(days=rnd.randint(3, 7)),
                    observacion=None,
                    estado=EstadoPedidoProveedor.PENDIENTE,
                    fecha_registro=datetime.combine(fecha, time(9, rnd.randint(0, 59))),
                    activo=True,
                    items=[
                        PedidoProveedorItem(
                            insumo_id=insumo_id,
                            cantidad_pedida=float(rnd.choice([50, 100, 200, 300, 500])),
                        )
                        for insumo_id in rnd.sample(catalogo, cantidad_items)
                    ],
                )
            )

    return pedidos


def main():
    db = SessionLocal()
    try:
        pedidos = generar_pedidos(db)
        db.add_all(pedidos)
        db.commit()

        items = sum(len(p.items) for p in pedidos)
        print(f"Se insertaron {len(pedidos)} pedidos a proveedores ({items} items).")
        if not pedidos:
            print("No se generaron pedidos nuevos (ya existen o no hay proveedores habilitados/personal).")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
