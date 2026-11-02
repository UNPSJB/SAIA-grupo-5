import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.receta import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/recetas", tags=["recetas"])


# Rutas para Receta

@router.post("/", response_model=schemas.Receta)
def create_receta(receta: schemas.RecetaCreate, db: Session = Depends(get_db)):
    return services.crear_receta(db, receta)

@router.get("/producto/{producto_id}", response_model=schemas.Receta)
def read_receta_de_producto(producto_id: int, db: Session = Depends(get_db)):
    return services.obtener_receta_de_producto(db, producto_id)

@router.get("/{receta_id}", response_model=schemas.Receta)
def read_receta(receta_id: int, db: Session = Depends(get_db)):
    return services.leer_receta(db, receta_id)

@router.put("/{receta_id}", response_model=schemas.Receta)
def update_receta(receta_id: int, receta: schemas.RecetaUpdate, db: Session = Depends(get_db)):
    return services.actualizar_receta(db, receta_id, receta)
