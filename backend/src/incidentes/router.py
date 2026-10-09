from typing import Literal

from fastapi import Depends
from sqlalchemy.orm import Session

from src.auth.dependencies import requiere_permiso_administrar
from src.auth.router_base import PermissionedRouter
from src.database import get_db
from src.incidentes import schemas, services

router = PermissionedRouter(prefix="/incidentes", tags=["incidentes"])


@router.get("/abiertos/por-tipo", response_model=list[schemas.IncidentesAbiertosPorTipo], dependencies=[Depends(requiere_permiso_administrar)])
def read_incidentes_abiertos_por_tipo(db: Session = Depends(get_db)):
    return services.contar_incidentes_abiertos_por_tipo(db)


@router.get("/abiertos", response_model=list[schemas.Incidente], dependencies=[Depends(requiere_permiso_administrar)])
def read_incidentes_abiertos(db: Session = Depends(get_db)):
    return services.listar_incidentes(db, estado="abierto", orden="asc")


@router.get("", response_model=list[schemas.Incidente], dependencies=[Depends(requiere_permiso_administrar)])
@router.get("/", response_model=list[schemas.Incidente], include_in_schema=False, dependencies=[Depends(requiere_permiso_administrar)])
def read_incidentes(
    estado: Literal["abierto", "cerrado"] | None = None,
    orden: Literal["asc", "desc"] = "desc",
    db: Session = Depends(get_db),
):
    return services.listar_incidentes(db, estado=estado, orden=orden)
