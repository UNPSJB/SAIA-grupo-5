import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.router_base import PermissionedRouter
from src.proveedor import schemas, services
from src.auth.dependencies import tiene_permiso_administrar

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/proveedores", tags=["proveedores"])


@router.post("/", response_model=schemas.Proveedor)
def create_proveedor(proveedor: schemas.ProveedorCreate, db: Session = Depends(get_db)):
    return services.crear_proveedor(db, proveedor)


@router.get("/", response_model=list[schemas.Proveedor])
def read_proveedores(db: Session = Depends(get_db)):
    return services.listar_proveedores(db)


@router.get("/{proveedor_id}", response_model=schemas.Proveedor)
def read_proveedor(proveedor_id: int, db: Session = Depends(get_db)):
    return services.leer_proveedor(db, proveedor_id)


@router.put("/{proveedor_id}", response_model=schemas.Proveedor)
def update_proveedor(proveedor_id: int, proveedor: schemas.ProveedorUpdate, db: Session = Depends(get_db)):
    return services.modificar_proveedor(db, proveedor_id, proveedor)


@router.patch("/{proveedor_id}/estado", response_model=schemas.Proveedor)
def cambiar_estado_proveedor(proveedor_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_proveedor(db, proveedor_id)


@router.patch("/{proveedor_id}/habilitacion", response_model=schemas.Proveedor)
def renovar_habilitacion(proveedor_id: int, datos: schemas.ProveedorRenovarHabilitacion, db: Session = Depends(get_db),):
    return services.renovar_habilitacion_proveedor(db, proveedor_id, datos)

@router.put("/{proveedor_id}/insumos", response_model=schemas.Proveedor, dependencies=[Depends(tiene_permiso_administrar)])
def update_insumos_proveedor(proveedor_id: int, datos: schemas.ProveedorInsumosUpdate, db: Session = Depends(get_db)):
    return services.asociar_insumos_proveedor(db, proveedor_id, datos)