import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.consumo_producto import schemas, services

# Creamos un logger para este módulo específico. Más info.: https://docs.python.org/3/library/logging.html
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/consumos_productos", tags=["consumos_productos"])


# Rutas para Consumo_producto

@router.post("/", response_model=schemas.ConsumoProducto)
def create_consumo_producto(consumo: schemas.ConsumoProductoCreate, db: Session = Depends(get_db)):
    return services.crear_consumo_producto(db, consumo)

@router.get("/{consumo_id}", response_model=schemas.ConsumoProducto)
def read_consumo_producto(consumo_id: int, db: Session = Depends(get_db)):
    return services.leer_consumo_producto(db, consumo_id)

@router.put("/{consumo_id}", response_model=schemas.ConsumoProducto)
def update_consumo_producto(consumo_id: int, consumo: schemas.ConsumoProductoUpdate, db: Session = Depends(get_db)):
    return services.modificar_consumo_producto(db, consumo_id, consumo)

# Rutas para Consumos_producto Admin

@router.get("/", response_model=list[schemas.ConsumoProducto])
def read_consumos_productos(db: Session = Depends(get_db)):
    return services.listar_consumos_productos(db)

@router.delete("/{consumo_id}", response_model=schemas.ConsumoProductoDelete)
def delete_consumo_producto(consumo_id: int, db: Session = Depends(get_db)):
    return services.eliminar_consumo_producto(db, consumo_id)

# Rutas para Consumos_acumulados

@router.get("/insumo/{insumo_id}", response_model=list[schemas.ConsumoProducto])
def read_consumos_por_producto(insumo_id:int, db: Session = Depends(get_db)):
    return services.listar_consumos_por_producto(db, insumo_id)

@router.get("/insumo/{insumo_id}/acumulado", response_model=float)
def read_consumo_acumulado(insumo_id:int, db: Session = Depends(get_db)):
    return services.consultar_consumo_acumulado(db, insumo_id)
