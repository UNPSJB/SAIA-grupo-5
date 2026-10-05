from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.auth.dependencies import tiene_permiso_administrar
from src.auth.router_base import PermissionedRouter
from src.database import get_db
from src.notificaciones import schemas, services
from src.personal.models import Persona

router = PermissionedRouter(prefix="/notificaciones", tags=["notificaciones"])


@router.post("/", response_model=list[schemas.Notificacion], status_code=status.HTTP_201_CREATED)
def create_notificaciones(
    datos: schemas.NotificacionCreate,
    db: Session = Depends(get_db),
):
    return services.crear_para_administradores(db, datos.model_dump(mode="json"))


@router.get("/", response_model=list[schemas.Notificacion], dependencies=[Depends(tiene_permiso_administrar)])
def read_notificaciones(
    db: Session = Depends(get_db),
    administrador: Persona = Depends(tiene_permiso_administrar),
):
    return services.listar_notificaciones(db, administrador.id)


@router.patch("/{notificacion_id}/leida", response_model=schemas.Notificacion)
def mark_notificacion_as_read(
    notificacion_id: int,
    db: Session = Depends(get_db),
    administrador: Persona = Depends(tiene_permiso_administrar),
):
    notificacion = services.marcar_como_leida(db, administrador.id, notificacion_id)
    if notificacion is None:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    return notificacion
