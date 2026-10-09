import logging
from datetime import datetime
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.historial_incidente.models import HistorialIncidente
from src.historial_incidente import schemas

logger = logging.getLogger(__name__)


def registrar_evento_historial(
    db: Session,
    incidente_id: int,
    tipo_evento: str,
    usuario_id: int,
    descripcion: str | None = None,
    accion_correctiva_id: int | None = None,
) -> HistorialIncidente:
    # Solo agrega la fila a la sesión -- no comitea. Queda dentro de la
    # transacción de quien la llama (crear_incidente, crear_accion_correctiva,
    # reabrir_incidente), para que el evento de historial y el cambio de
    # estado del incidente se guarden atómicamente o no se guarde ninguno.
    _evento = HistorialIncidente(
        incidente_id=incidente_id,
        tipo_evento=tipo_evento,
        fecha_evento=datetime.now(),
        usuario_id=usuario_id,
        descripcion=descripcion,
        accion_correctiva_id=accion_correctiva_id,
    )
    db.add(_evento)
    return _evento


def listar_historial_de_incidente(db: Session, incidente_id: int) -> List[schemas.HistorialIncidente]:
    return db.scalars(
        select(HistorialIncidente)
        .where(HistorialIncidente.incidente_id == incidente_id)
        .order_by(HistorialIncidente.fecha_evento.asc())
    ).all()
