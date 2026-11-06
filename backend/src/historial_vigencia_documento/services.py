import logging
from datetime import datetime
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.historial_vigencia_documento.models import HistorialVigencia
from src.historial_vigencia_documento import schemas
from src.documentos.models import Documento
from src.documentos import exceptions as documento_exceptions

logger = logging.getLogger(__name__)


def registrar_cambio(
    db: Session,
    documento_id: int,
    version_anterior_id: int | None,
    version_nueva_id: int,
    persona_id: int,
    fecha_hora: datetime,
) -> HistorialVigencia:
    registro = HistorialVigencia(
        documento_id=documento_id,
        version_anterior_id=version_anterior_id,
        version_nueva_id=version_nueva_id,
        persona_id=persona_id,
        fecha_hora=fecha_hora,
    )
    db.add(registro)
    db.flush()
    return registro


def listar_historial_por_documento(db: Session, documento_id: int) -> List[schemas.HistorialVigencia]:
    documento = db.scalar(
        select(Documento)
        .where(Documento.id == documento_id)
    )

    if documento is None:
        raise documento_exceptions.DocumentoNoEncontrado()

    return db.scalars(
        select(HistorialVigencia)
        .where(HistorialVigencia.documento_id == documento_id)
        .order_by(HistorialVigencia.fecha_hora.desc(), HistorialVigencia.id.desc())
    ).all()