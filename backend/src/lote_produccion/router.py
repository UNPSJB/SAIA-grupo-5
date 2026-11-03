import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from typing import Literal
from datetime import date
from src.auth.dependencies import get_current_persona, requiere_permiso_administrar, tiene_permiso_administrar
from src.database import get_db
from src.lote_produccion import schemas, services
from src.auth.router_base import PermissionedRouter
from src.auth.dependencies import tiene_permiso_operar

from datetime import date
from fastapi import Query, HTTPException

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/lotes-produccion", tags=["lotes_produccion"])


@router.post("/", response_model=schemas.LoteProduccion, dependencies=[Depends(tiene_permiso_operar)])
def create_lote_produccion(lote: schemas.LoteProduccionCreate, db: Session = Depends(get_db)):
    return services.crear_lote_produccion(db, lote)


@router.get("/", response_model=list[schemas.LoteProduccion])
def read_lotes_produccion(db: Session = Depends(get_db)):
    return services.listar_lotes_produccion(db)

@router.get("/historial", response_model=schemas.LoteProduccionHistorial, dependencies=[Depends(requiere_permiso_administrar)])
def read_lotes_historial(
    orden: Literal["asc", "desc"] = "desc",
    producto_id: int | None = None,
    fecha_desde: date | None = None,
    fecha_hasta: date | None = None,
    db: Session = Depends(get_db),
):
    return services.listar_lotes_historial(
        db, orden=orden,
        producto_id=producto_id, fecha_desde=fecha_desde, fecha_hasta=fecha_hasta,
    )

@router.get("/estadisticas", response_model=list[schemas.EstadisticaProduccion], dependencies=[Depends(tiene_permiso_administrar)])
def read_estadisticas_produccion(fecha_desde: date = Query(...), fecha_hasta: date = Query(...), producto_id: int | None = None, db: Session = Depends(get_db)):
    if fecha_hasta < fecha_desde:
        raise HTTPException(
            status_code=400,
            detail="La fecha hasta no puede ser menor a la fecha desde."
        )

    return services.obtener_estadisticas_produccion(
        db, fecha_desde, fecha_hasta, producto_id
    )


@router.get("/{lote_id}", response_model=schemas.LoteProduccion)
def read_lote_produccion(lote_id: int, db: Session = Depends(get_db)):
    return services.leer_lote_produccion(db, lote_id)

@router.get("/producto/{producto_id}", response_model=list[schemas.LoteProduccion])
def read_lotes_por_producto(producto_id: int, db: Session = Depends(get_db)):
    return services.listar_lotes_por_producto(db, producto_id)


@router.patch("/{lote_id}/estado", response_model=schemas.LoteProduccion, dependencies=[Depends(tiene_permiso_operar)])
def cambiar_estado_lote_produccion(lote_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_lote_produccion(db, lote_id)


@router.put("/{lote_id}", response_model=schemas.LoteProduccion, dependencies=[Depends(tiene_permiso_operar)])
def update_lote_produccion(lote_id: int, lote: schemas.LoteProduccionUpdate, db: Session = Depends(get_db)):
    return services.modificar_lote_produccion(db, lote_id, lote)



