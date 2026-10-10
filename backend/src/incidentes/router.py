from typing import Literal

from fastapi import Depends
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_persona, requiere_permiso_administrar
from src.auth.router_base import PermissionedRouter
from src.database import get_db
from src.incidentes import schemas, services

router = PermissionedRouter(prefix="/incidentes", tags=["incidentes"])


@router.get("/abiertos/por-tipo", response_model=list[schemas.IncidentesAbiertosPorTipo], dependencies=[Depends(requiere_permiso_administrar)])
def read_incidentes_abiertos_por_tipo(db: Session = Depends(get_db)):
    return services.contar_incidentes_abiertos_por_tipo(db)


@router.get("/abiertos", response_model=list[schemas.IncidenteSeguimiento], dependencies=[Depends(requiere_permiso_administrar)])
def read_incidentes_abiertos(db: Session = Depends(get_db)):
    return services.listar_incidentes(db, estado="abierto", orden="asc")


@router.get("/abiertos-crud", response_model=list[schemas.Incidente], dependencies=[Depends(requiere_permiso_administrar)])
def read_incidentes_abiertos_crud(db: Session = Depends(get_db)):
    return services.listar_incidentes_abiertos(db)


@router.get("/cerrados", response_model=list[schemas.Incidente], dependencies=[Depends(requiere_permiso_administrar)])
def read_incidentes_cerrados(db: Session = Depends(get_db)):
    return services.listar_incidentes_cerrados(db)


@router.get("", response_model=list[schemas.IncidenteSeguimiento], dependencies=[Depends(requiere_permiso_administrar)])
@router.get("/", response_model=list[schemas.IncidenteSeguimiento], include_in_schema=False, dependencies=[Depends(requiere_permiso_administrar)])
def read_incidentes(
    estado: Literal["abierto", "cerrado"] | None = None,
    orden: Literal["asc", "desc"] = "desc",
    db: Session = Depends(get_db),
):
    return services.listar_incidentes(db, estado=estado, orden=orden)


@router.post("/", response_model=schemas.Incidente)
def create_incidente(
    incidente: schemas.IncidenteCreate,
    db: Session = Depends(get_db),
    persona=Depends(get_current_persona),
):
    return services.crear_incidente(db, incidente, persona)


@router.get("/{incidente_id}", response_model=schemas.Incidente)
def read_incidente(incidente_id: int, db: Session = Depends(get_db)):
    return services.leer_incidente(db, incidente_id)


@router.put("/{incidente_id}", response_model=schemas.Incidente)
def update_incidente(
    incidente_id: int,
    incidente: schemas.IncidenteUpdate,
    db: Session = Depends(get_db),
):
    return services.modificar_incidente(db, incidente_id, incidente)


@router.patch("/{incidente_id}/estado", response_model=schemas.Incidente)
def cambiar_estado_incidente(incidente_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_incidente(db, incidente_id)
