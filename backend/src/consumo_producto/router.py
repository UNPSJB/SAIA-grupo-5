import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.consumo_producto import schemas, services, models
from src.auth.dependencies import tiene_permiso_administrar, get_current_persona
from src.auth.router_base import PermissionedRouter
from src.exceptions import PermissionDenied
from datetime import date


logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/consumos-productos", tags=["consumos-productos"])
 
# Rutas para Consumo_producto

@router.post("/", response_model=schemas.ConsumoProducto)
def create_consumo_producto(consumo: schemas.ConsumoProductoCreate, db: Session = Depends(get_db)):
    return services.crear_consumo_producto(db, consumo)

@router.put("/{consumo_id}", response_model=schemas.ConsumoProducto)
def update_consumo_producto(consumo_id: int, consumo: schemas.ConsumoProductoUpdate, db: Session = Depends(get_db)):
    return services.modificar_consumo_producto(db, consumo_id, consumo)

@router.patch("/{consumo_id}/estado", response_model=schemas.ConsumoProducto)
def cambiar_estado_consumo_producto(consumo_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_consumo_producto(db, consumo_id)

# Rutas para Consumos_acumulados

@router.get("/", response_model=list[schemas.ConsumoProducto])
def read_consumos_productos(db: Session = Depends(get_db)):
    return services.listar_consumos_productos(db)

# Listar consumos por insumo
@router.get("/insumo/{insumo_id}", response_model=list[schemas.ConsumoProducto])
def read_consumos_por_producto(insumo_id:int, db: Session = Depends(get_db)):
    return services.listar_consumos_por_producto(db, insumo_id)

# Consumo acumulado de un insumo
@router.get("/insumo/{insumo_id}/acumulado", response_model=float)
def read_consumo_acumulado(insumo_id:int, fecha_desde: date | None = None, fecha_hasta: date | None = None, db: Session = Depends(get_db)):
    return services.consultar_consumo_acumulado(db, insumo_id, fecha_desde, fecha_hasta,)

# Consumo acumulado de cada producto
@router.get("/acumulado", response_model=list[schemas.ConsumoAcumuladoProducto])
def read_consumo_acumulado_productos(fecha_desde: date | None = None, fecha_hasta: date | None = None, db: Session = Depends(get_db)):
    return services.listar_consumos_acumulados(db, fecha_desde, fecha_hasta,)

# Listar consumos por tarea
@router.get("/tarea/{tarea_id}", response_model=list[schemas.ConsumoProducto])
def read_consumos_por_tarea(tarea_id:int, db: Session = Depends(get_db)):
    return services.listar_consumos_por_tarea(db, tarea_id)

@router.get("/{consumo_id}", response_model=schemas.ConsumoProducto)
def read_consumo_producto(consumo_id: int, db: Session = Depends(get_db)):
    return services.leer_consumo_producto(db, consumo_id)