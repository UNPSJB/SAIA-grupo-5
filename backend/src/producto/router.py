import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.producto import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/productos", tags=["productos"])


@router.post("/", response_model=schemas.Producto)
def create_producto(producto: schemas.ProductoCreate, db: Session = Depends(get_db)):
    return services.crear_producto(db, producto)


@router.get("/", response_model=list[schemas.Producto])
def read_productos(db: Session = Depends(get_db)):
    return services.listar_productos(db)


@router.get("/{producto_id}", response_model=schemas.Producto)
def read_producto(producto_id: int, db: Session = Depends(get_db)):
    return services.leer_producto(db, producto_id)


@router.patch("/{producto_id}/estado", response_model=schemas.Producto)
def cambiar_estado_producto(producto_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_producto(db, producto_id)


@router.put("/{producto_id}", response_model=schemas.Producto)
def update_producto(producto_id: int, producto: schemas.ProductoUpdate, db: Session = Depends(get_db)):
    return services.modificar_producto(db, producto_id, producto)
