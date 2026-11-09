import logging
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from src.envios_lote.models import EnvioLote, EstadoEnvio
from src.envios_lote import schemas, exceptions
from src.lote_produccion.models import LoteProduccion, EstadoLote
from src.clientes.models import Cliente
from src.direcciones_cliente.models import DireccionCliente

logger = logging.getLogger(__name__)


def generar_siguiente_remito(db: Session) -> str:
    ultimo_envio = db.scalar(
        select(EnvioLote).order_by(EnvioLote.id.desc()).limit(1)
    )
    siguiente_numero = (ultimo_envio.id + 1) if ultimo_envio else 1

    return f"R-0001-{siguiente_numero:08d}"


def leer_envio(db: Session, envio_id: int) -> EnvioLote:
    db_envio = db.scalar(select(EnvioLote).where(EnvioLote.id == envio_id).options(
            joinedload(EnvioLote.cliente),
            joinedload(EnvioLote.direccion)))
    
    if db_envio is None:
        raise exceptions.EnvioNoEncontrado()
    return db_envio


def crear_envio(db: Session, datos: schemas.EnvioLoteCreate) -> EnvioLote:
    db_lote = db.scalar(select(LoteProduccion).where(LoteProduccion.id == datos.lote_id))
    if db_lote is None:
        raise exceptions.LoteNoEncontrado()

    estados_permitidos = [EstadoLote.TERMINADO.value, EstadoLote.PARCIALMENTE_DESPACHADO.value]
    if db_lote.estado not in estados_permitidos:
        raise exceptions.EstadoLoteInvalido()

    if datos.cantidad <= 0:
        raise exceptions.CantidadInvalida()

    if db_lote.cantidad_disponible is None:
        db_lote.cantidad_disponible = db_lote.cantidad_producida

    if datos.cantidad > db_lote.cantidad_disponible:
        raise exceptions.StockInsuficiente()

    if datos.fecha_envio < db_lote.fecha_produccion:
        raise exceptions.FechaEnvioAnteriorAProduccion()

    db_cliente = db.scalar(select(Cliente).where(Cliente.id == datos.cliente_id))
    if db_cliente is None:
        raise exceptions.ClienteNoEncontrado()
    if not db_cliente.activo:
        raise exceptions.ClienteDadoDeBaja()

    db_direccion = db.scalar(select(DireccionCliente).where(DireccionCliente.id == datos.direccion_cliente_id))
    if db_direccion is None:
        raise exceptions.DireccionNoEncontrada()
    if db_direccion.cliente_id != db_cliente.id:
        raise exceptions.DireccionNoPerteneceAlCliente()

    if not datos.numero_remito or not datos.numero_remito.strip():
        numero_remito = generar_siguiente_remito(db)
    else:
        numero_remito = datos.numero_remito.strip()

    nuevo_envio = EnvioLote(
        lote_id=datos.lote_id,
        cliente_id=datos.cliente_id,
        direccion_cliente_id=datos.direccion_cliente_id,
        cantidad=datos.cantidad,
        numero_remito=numero_remito,
        transportista=datos.transportista.strip(),
        fecha_envio=datos.fecha_envio,
        estado=EstadoEnvio.EN_CAMINO.value,
    )
    db.add(nuevo_envio)

    db_lote.cantidad_disponible -= datos.cantidad
    if db_lote.cantidad_disponible == 0:
        db_lote.estado = EstadoLote.ENVIADO.value
    else:
        db_lote.estado = EstadoLote.PARCIALMENTE_DESPACHADO.value

    db.commit()
    db.refresh(nuevo_envio)
    return leer_envio(db, nuevo_envio.id)


def registrar_recepcion_envio(db: Session, envio_id: int, datos: schemas.EnvioLoteUpdate) -> EnvioLote:
    db_envio = leer_envio(db, envio_id)

    if db_envio.estado != EstadoEnvio.EN_CAMINO.value:
        raise exceptions.EnvioYaProcesado()

    if datos.fecha_entrega < db_envio.fecha_envio:
        raise exceptions.FechaEntregaAnteriorAEnvio()

    db_lote = db.scalar(select(LoteProduccion).where(LoteProduccion.id == db_envio.lote_id))
    db_envio.observaciones = datos.observaciones
    db_envio.fecha_entrega = datos.fecha_entrega

    if datos.recibido:
        db_envio.estado = EstadoEnvio.ENTREGADO.value
    else:
        db_envio.estado = EstadoEnvio.RECHAZADO.value

        if db_lote:
            db_lote.cantidad_disponible += db_envio.cantidad
            if db_lote.cantidad_disponible == db_lote.cantidad_producida:
                db_lote.estado = EstadoLote.TERMINADO.value
            else:
                db_lote.estado = EstadoLote.PARCIALMENTE_DESPACHADO.value

    db.commit()
    db.refresh(db_envio)
    return db_envio


def listar_envios_por_lote(db: Session, lote_id: int) -> List[EnvioLote]:
    return db.scalars(select(EnvioLote).where(EnvioLote.lote_id == lote_id).options(
            joinedload(EnvioLote.cliente),
            joinedload(EnvioLote.direccion))
            .order_by(EnvioLote.fecha_envio.desc(), EnvioLote.id.desc())).all()