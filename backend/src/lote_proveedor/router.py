import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.auth.dependencies import tiene_permiso_operar
from src.auth.router_base import PermissionedRouter
from src.database import get_db
from src.lote_proveedor import schemas, services

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/lotes-proveedor", tags=["lotes_proveedor"])


@router.post("/", response_model=schemas.LoteProveedor, dependencies=[Depends(tiene_permiso_operar)])
def create_lote_proveedor(lote: schemas.LoteProveedorCreate, db: Session = Depends(get_db), usuario = Depends(tiene_permiso_operar)):
    return services.crear_lote_proveedor(db, lote, usuario_id=usuario.id)


@router.get("/", response_model=list[schemas.LoteProveedor])
def read_lotes_proveedor(db: Session = Depends(get_db)):
    return services.listar_lotes_proveedor(db)


@router.get("/{lote_proveedor_id}", response_model=schemas.LoteProveedor)
def read_lote_proveedor(lote_proveedor_id: int, db: Session = Depends(get_db)):
    return services.leer_lote_proveedor(db, lote_proveedor_id)


@router.put("/{lote_proveedor_id}", response_model=schemas.LoteProveedor, dependencies=[Depends(tiene_permiso_operar)])
def update_lote_proveedor(lote_proveedor_id: int, lote: schemas.LoteProveedorUpdate, db: Session = Depends(get_db)):
    return services.modificar_lote_proveedor(db, lote_proveedor_id, lote)


@router.patch("/{lote_proveedor_id}/estado", response_model=schemas.LoteProveedor, dependencies=[Depends(tiene_permiso_operar)])
def cambiar_estado_lote_proveedor(lote_proveedor_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_lote_proveedor(db, lote_proveedor_id)


@router.patch("/{lote_proveedor_id}/avanzar-etapa", response_model=schemas.LoteProveedor, dependencies=[Depends(tiene_permiso_operar)])
def avanzar_etapa_lote(lote_proveedor_id: int, datos: schemas.AvanzarEtapaLote, db: Session = Depends(get_db),):
    return services.avanzar_etapa_lote_proveedor(db, lote_proveedor_id, datos)