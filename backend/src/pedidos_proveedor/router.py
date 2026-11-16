import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.auth.dependencies import get_current_persona, tiene_permiso_administrar
from src.auth.router_base import PermissionedRouter
from src.database import get_db
from src.personal import models as personal_models
from src.pedidos_proveedor import schemas, services

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/pedidos-proveedor", tags=["pedidos_proveedor"])


@router.post("/", response_model=schemas.PedidoProveedor, dependencies=[Depends(tiene_permiso_administrar)])
def create_pedido_proveedor(pedido: schemas.PedidoProveedorCreate, db: Session = Depends(get_db), persona_actual: personal_models.Persona = Depends(get_current_persona),):
    return services.crear_pedido_proveedor(db, pedido, usuario_id=persona_actual.id)


@router.get("/", response_model=list[schemas.PedidoProveedor])
def read_pedidos_proveedor(db: Session = Depends(get_db)):
    return services.listar_pedidos_proveedor(db)


@router.get("/{pedido_id}", response_model=schemas.PedidoProveedor)
def read_pedido_proveedor(pedido_id: int, db: Session = Depends(get_db)):
    return services.leer_pedido_proveedor(db, pedido_id)


@router.put("/{pedido_id}", response_model=schemas.PedidoProveedor, dependencies=[Depends(tiene_permiso_administrar)])
def update_pedido_proveedor(pedido_id: int, datos: schemas.PedidoProveedorUpdate, db: Session = Depends(get_db)):
    return services.modificar_pedido_proveedor(db, pedido_id, datos)


@router.patch("/{pedido_id}/estado", response_model=schemas.PedidoProveedor, dependencies=[Depends(tiene_permiso_administrar)])
def cambiar_estado_pedido_proveedor(pedido_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_pedido_proveedor(db, pedido_id)