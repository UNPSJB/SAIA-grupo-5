import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.dependencies import tiene_permiso_administrar
from src.lote_produccion import schemas, services
from src.auth.router_base import PermissionedRouter
from datetime import date
from fastapi import Query, HTTPException

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/lotes-produccion", tags=["lotes_produccion"])

@router.get("/estadisticas", response_model=list[schemas.EstadisticaProduccion], dependencies=[Depends(tiene_permiso_administrar)])
def read_estadisticas_produccion(
    fecha_desde: date = Query(...),
    fecha_hasta: date = Query(...),
    producto_id: int | None = None,
    db: Session = Depends(get_db)
):
    if fecha_hasta < fecha_desde:
        raise HTTPException(
            status_code=400,
            detail="La fecha hasta no puede ser menor a la fecha desde."
        )

    return services.obtener_estadisticas_produccion(
        db, fecha_desde, fecha_hasta, producto_id
    )