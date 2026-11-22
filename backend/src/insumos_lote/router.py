from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.dependencies import tiene_permiso_operar, tiene_permiso_operar_o_supervisor
from src.auth.router_base import PermissionedRouter
from src.insumos_lote import schemas, services

router = PermissionedRouter(prefix="/insumos-lote", tags=["insumos_lote"])


@router.get("/", response_model=list[schemas.InsumoLote])
def read_insumos_lote(db: Session = Depends(get_db)):
    return services.listar_todos_los_insumos_lote(db)


@router.get("/{insumo_lote_id}", response_model=schemas.InsumoLote)
def read_insumo_lote(insumo_lote_id: int, db: Session = Depends(get_db)):
    return services.leer_insumo_lote(db, insumo_lote_id)


@router.get("/{insumo_lote_id}/trazabilidad", response_model=schemas.TrazabilidadInsumoLote)
def read_trazabilidad_insumo_lote(insumo_lote_id: int, db: Session = Depends(get_db)):
    return services.obtener_trazabilidad_insumo_lote(db, insumo_lote_id)


@router.get("/lote/{lote_proveedor_id}", response_model=list[schemas.InsumoLote])
def read_insumos_por_lote(lote_proveedor_id: int, db: Session = Depends(get_db)):
    return services.listar_insumos_de_lote(db, lote_proveedor_id)


@router.post("/lote/{lote_proveedor_id}", response_model=schemas.InsumoLote, dependencies=[Depends(tiene_permiso_operar)])
def create_insumo_lote(lote_proveedor_id: int, datos: schemas.InsumoLoteCreate, db: Session = Depends(get_db)):
    return services.agregar_insumo_a_lote(db, lote_proveedor_id, datos)


@router.patch("/{insumo_lote_id}/estado", response_model=schemas.InsumoLote, dependencies=[Depends(tiene_permiso_operar)])
def cambiar_estado_insumo_lote(insumo_lote_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_insumo_lote(db, insumo_lote_id)


@router.patch("/{insumo_lote_id}/almacenamiento", response_model=schemas.InsumoLote, dependencies=[Depends(tiene_permiso_operar_o_supervisor)])
def update_almacenamiento_insumo_lote(insumo_lote_id: int, datos: schemas.ActualizarAlmacenamiento, db: Session = Depends(get_db)):
    return services.actualizar_almacenamiento_insumo_lote(db, insumo_lote_id, datos)


@router.delete("/{insumo_lote_id}", dependencies=[Depends(tiene_permiso_operar)])
def delete_insumo_lote(insumo_lote_id: int, db: Session = Depends(get_db)):
    services.eliminar_insumo_de_lote(db, insumo_lote_id)