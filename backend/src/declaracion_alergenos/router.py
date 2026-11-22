import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.auth.dependencies import tiene_permiso_administrar
from src.auth.router_base import PermissionedRouter
from src.database import get_db
from src.declaracion_alergenos import schemas, services
from src.personal.models import Persona

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/declaracion-alergenos", tags=["declaracion_alergenos"])


@router.get("/producto/{producto_id}", response_model=schemas.DeclaracionAlergenos)
def read_declaracion_por_producto(producto_id: int, db: Session = Depends(get_db)):
    return services.leer_declaracion_producto(db, producto_id)

@router.post("/receta/{receta_id}/new", response_model=schemas.DeclaracionAlergenos)
def crear_declaracion_receta(receta_id: int, db: Session = Depends(get_db)):
    return services.crear_propuesta_receta(db, receta_id)

@router.get("/receta/{receta_id}", response_model=schemas.DeclaracionAlergenos)
def read_declaracion_receta(receta_id: int, db: Session = Depends(get_db)):
    return services.leer_declaracion_receta(db, receta_id)

@router.put("/receta/{receta_id}", response_model=schemas.DeclaracionAlergenos)
def update_declaracion_receta(receta_id: int, datos: schemas.DeclaracionAlergenosUpdate, db: Session = Depends(get_db)):
    return services.modificar_declaracion_receta(db, receta_id, datos)

@router.patch("/receta/{receta_id}/confirmar", response_model=schemas.DeclaracionAlergenos)
def confirmar_declaracion_receta(receta_id: int, db: Session = Depends(get_db), persona: Persona = Depends(tiene_permiso_administrar)):
    return services.confirmar_declaracion_receta(db, receta_id, persona)