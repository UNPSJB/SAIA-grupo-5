"""
Pobla la base de datos con envíos de lotes de producción a clientes (EnvioLote).
Replica las reglas de envios_lote.services:
  - solo se despachan lotes activos en estado Terminado / Parcialmente despachado,
  - se descuenta cantidad_disponible y el lote pasa a Parcialmente despachado o Enviado,
  - un envío rechazado devuelve la mercadería al lote.
Requiere: seed_lote_produccion, seed_clientes.
Uso: python -m scripts.seed_envios
"""
from datetime import date, timedelta
from random import Random

from sqlalchemy import func, select

import src.all_models  # noqa: F401
from src.database import SessionLocal
from src.clientes.models import Cliente
from src.envios_lote.models import EnvioLote, EstadoEnvio
from src.lote_produccion.models import EstadoLote, LoteProduccion

PROPORCION_LOTES_DESPACHADOS = 0.6
TRANSPORTISTAS = ["Transporte Propio", "Expreso Patagónico", "Vía Cargo", "Andreani"]


def _estado_lote(lote: LoteProduccion) -> str:
    if lote.cantidad_disponible == 0:
        return EstadoLote.ENVIADO.value
    if lote.cantidad_disponible == lote.cantidad_producida:
        return EstadoLote.TERMINADO.value
    return EstadoLote.PARCIALMENTE_DESPACHADO.value


def generar_envios(db) -> list[EnvioLote]:
    rnd = Random(23)
    hoy = date.today()

    clientes = [
        c for c in db.scalars(select(Cliente).where(Cliente.activo == True)).all()  # noqa: E712
        if any(d.activo for d in c.direcciones)
    ]
    if not clientes:
        return []

    lotes = db.scalars(
        select(LoteProduccion)
        .where(
            LoteProduccion.activo == True,  # noqa: E712
            LoteProduccion.estado == EstadoLote.TERMINADO.value,
            ~LoteProduccion.envios.any(),
        )
        .order_by(LoteProduccion.fecha_produccion)
    ).all()

    siguiente = (db.scalar(select(func.max(EnvioLote.id))) or 0) + 1
    envios = []

    for lote in lotes:
        if rnd.random() > PROPORCION_LOTES_DESPACHADOS:
            continue

        # 1 o 2 despachos por lote: total o parcial.
        for _ in range(rnd.randint(1, 2)):
            if lote.cantidad_disponible <= 0:
                break
            cantidad = (
                lote.cantidad_disponible
                if rnd.random() < 0.5
                else rnd.randint(1, lote.cantidad_disponible)
            )
            cliente = rnd.choice(clientes)
            direccion = rnd.choice([d for d in cliente.direcciones if d.activo])
            fecha_envio = min(lote.fecha_produccion + timedelta(days=rnd.randint(1, 4)), hoy)

            # Envíos de hace más de 2 días ya tienen resultado; los recientes siguen en camino.
            if (hoy - fecha_envio).days > 2:
                estado = EstadoEnvio.RECHAZADO.value if rnd.random() < 0.08 else EstadoEnvio.ENTREGADO.value
                fecha_entrega = fecha_envio + timedelta(days=rnd.randint(1, 2))
            else:
                estado = EstadoEnvio.EN_CAMINO.value
                fecha_entrega = None

            envios.append(
                EnvioLote(
                    lote=lote,
                    cliente_id=cliente.id,
                    direccion_cliente_id=direccion.id,
                    cantidad=cantidad,
                    numero_remito=f"R-0001-{siguiente:08d}",
                    transportista=rnd.choice(TRANSPORTISTAS),
                    estado=estado,
                    fecha_envio=fecha_envio,
                    fecha_entrega=fecha_entrega,
                    observaciones="Mercadería rechazada por el cliente" if estado == EstadoEnvio.RECHAZADO.value else None,
                )
            )
            siguiente += 1

            if estado != EstadoEnvio.RECHAZADO.value:
                lote.cantidad_disponible -= cantidad

        lote.estado = _estado_lote(lote)

    return envios


def main():
    db = SessionLocal()
    try:
        envios = generar_envios(db)
        db.add_all(envios)
        db.commit()

        por_estado: dict[str, int] = {}
        for envio in envios:
            por_estado[envio.estado] = por_estado.get(envio.estado, 0) + 1
        detalle = ", ".join(f"{n} {estado.lower()}" for estado, n in por_estado.items())
        print(f"Se insertaron {len(envios)} envíos" + (f" ({detalle})." if detalle else "."))
        if not envios:
            print("No se generaron envíos (no hay lotes terminados sin despachar o clientes activos).")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
