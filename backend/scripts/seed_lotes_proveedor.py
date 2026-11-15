"""
Pobla la base de datos con recepciones de mercadería: LoteProveedor + InsumoLote
+ HistorialEstadoLoteProveedor.

Por cada pedido PENDIENTE con más de 5 días se registra un lote de proveedor con
los mismos insumos/cantidades del pedido, y el pedido pasa a RECIBIDO (como hace
crear_lote_proveedor). El estado del lote avanza según la antigüedad:
LLEGADA -> DESEMPAQUE -> ACOMODADO, dejando un hito de historial por etapa.
Requiere: seed_pedidos_proveedor.
Uso: python -m scripts.seed_lotes_proveedor
"""
from datetime import datetime, time, timedelta
from decimal import Decimal
from random import Random

from sqlalchemy import select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.insumos_lote.models import InsumoLote
from src.lote_proveedor.constants import EstadoLoteProveedor
from src.lote_proveedor.models import LoteProveedor, HistorialEstadoLoteProveedor
from src.pedidos_proveedor.constants import EstadoPedidoProveedor
from src.pedidos_proveedor.models import PedidoProveedor

DIAS_MINIMOS_PARA_RECIBIR = 5
MARCAS = ["La Serenísima", "Molinos", "Ledesma", "Arcor", "Granja del Sol", "Sin marca"]

# (estado, texto del historial, horas desde la llegada)
ETAPAS = [
    (EstadoLoteProveedor.LLEGADA, "Llegada", 0),
    (EstadoLoteProveedor.DESEMPAQUE, "Desempaque", 2),
    (EstadoLoteProveedor.ACOMODADO, "Acomodado", 5),
]


def generar_lotes_proveedor(db) -> list[LoteProveedor]:
    rnd = Random(11)
    hoy = datetime.now().date()

    pedidos = db.scalars(
        select(PedidoProveedor)
        .where(
            PedidoProveedor.activo == True,  # noqa: E712
            PedidoProveedor.estado == EstadoPedidoProveedor.PENDIENTE,
            PedidoProveedor.fecha_pedido <= hoy - timedelta(days=DIAS_MINIMOS_PARA_RECIBIR),
        )
        .order_by(PedidoProveedor.fecha_pedido)
    ).all()

    lotes = []
    for pedido in pedidos:
        fecha_recepcion = min(pedido.fecha_entrega_estimada or pedido.fecha_pedido, hoy)
        llegada = datetime.combine(fecha_recepcion, time(8, rnd.randint(0, 59)))
        antiguedad = (hoy - fecha_recepcion).days

        # Lotes recién llegados quedan a mitad de camino para poder probar el avance de etapa.
        if antiguedad >= 3:
            etapas = ETAPAS
        elif antiguedad >= 1:
            etapas = ETAPAS[:2]
        else:
            etapas = ETAPAS[:1]

        lote = LoteProveedor(
            proveedor_id=pedido.proveedor_id,
            registrado_por_id=pedido.registrado_por_id,
            numero_remito=f"0001-{pedido.proveedor_id:03d}{pedido.id:05d}",
            fecha_recepcion=fecha_recepcion,
            pedido_id=pedido.id,
            estado=etapas[-1][0],
            fecha_registro=llegada,
            activo=True,
            insumos=[
                InsumoLote(
                    insumo_id=item.insumo_id,
                    marca=rnd.choice(MARCAS),
                    cantidad=int(item.cantidad_pedida),
                    cantidad_restante=int(item.cantidad_pedida),
                    fecha_vencimiento=fecha_recepcion + timedelta(days=rnd.randint(90, 240)),
                    costo_unitario=Decimal(rnd.randint(50, 2500)) / 10,
                    minimo_alerta=int(item.cantidad_pedida * 0.2),
                    numero_lote=f"L{fecha_recepcion:%y%m%d}-{item.insumo_id:03d}-{rnd.randint(100, 999)}",
                    activo=True,
                )
                for item in pedido.items
            ],
            historial_estados=[
                HistorialEstadoLoteProveedor(
                    estado=texto,
                    fecha_hora=llegada + timedelta(hours=horas),
                    usuario_id=pedido.registrado_por_id,
                    observacion="Recepción inicial de mercadería" if estado == EstadoLoteProveedor.LLEGADA else None,
                )
                for estado, texto, horas in etapas
            ],
        )
        pedido.estado = EstadoPedidoProveedor.RECIBIDO
        lotes.append(lote)

    return lotes


def main():
    db = SessionLocal()
    try:
        lotes = generar_lotes_proveedor(db)
        db.add_all(lotes)
        db.commit()

        insumos = sum(len(lote.insumos) for lote in lotes)
        acomodados = sum(1 for lote in lotes if lote.estado == EstadoLoteProveedor.ACOMODADO)
        print(
            f"Se insertaron {len(lotes)} lotes de proveedor ({acomodados} acomodados) "
            f"con {insumos} insumos en stock."
        )
        if not lotes:
            print("No se generaron lotes nuevos (no hay pedidos pendientes con antigüedad suficiente).")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
