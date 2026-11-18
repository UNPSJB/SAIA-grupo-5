import logging
from datetime import datetime
from typing import List
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from src.historial_nutricional_insumo.models import HistorialNutricionalInsumo
from src.historial_nutricional_insumo import schemas

logger = logging.getLogger(__name__)

def listar_historiales_por_info_nutricional(db: Session, info_nutricional_id: int) -> List[schemas.HistorialNutricionalInsumo]:
    return db.scalars(select(HistorialNutricionalInsumo).options(joinedload(HistorialNutricionalInsumo.modificada_por))
            .where(HistorialNutricionalInsumo.info_nutricional_id == info_nutricional_id)
            .order_by(HistorialNutricionalInsumo.fecha_modificacion.desc())).all()

def registrar_cambio(db: Session, informacion_nutricional_id: int, dato_modificado: str, valor_anterior: Decimal | str | None, 
              valor_nuevo: Decimal | str | None, persona_id: int, fecha: datetime, motivo: str | None = None) -> schemas.HistorialNutricionalInsumo:

    _nuevo_historial = HistorialNutricionalInsumo(
        info_nutricional_id = informacion_nutricional_id,
        dato_modificado = dato_modificado,
        valor_anterior = str(valor_anterior) if valor_anterior is not None else None,
        valor_nuevo = str(valor_nuevo) if valor_nuevo is not None else None,
        motivo = motivo,
        modificada_por_id = persona_id,
        fecha_modificacion = fecha,
        )
    
    db.add(_nuevo_historial)
    return _nuevo_historial 
