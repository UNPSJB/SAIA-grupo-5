from datetime import date, datetime, time, timedelta
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from src.receta.models import Receta


def buscar_receta_para_lote(db: Session, producto_id: int, fecha_produccion: date) -> Receta | None:
    fecha = datetime.now() if fecha_produccion == date.today() else datetime.combine(fecha_produccion + timedelta(days=1), time.min)
    receta = db.scalars(
        select(Receta)
        .where(
            Receta.producto_id == producto_id,
            or_(Receta.fecha_desde_vigencia.is_(None), Receta.fecha_desde_vigencia <= fecha),
            or_(Receta.fecha_hasta_vigencia.is_(None), Receta.fecha_hasta_vigencia > fecha),
        )
        .order_by(Receta.version.desc())
    ).first()
    if receta is None:
        receta = db.scalars(select(Receta).where(Receta.producto_id == producto_id, Receta.vigente.is_(True))).first()
    return receta
