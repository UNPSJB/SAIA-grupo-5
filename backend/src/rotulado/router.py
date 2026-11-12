import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.rotulado import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/rotulado", tags=["rotulado"])


@router.get("/reglas", response_model=list[schemas.ReglasRotulado])
def read_versiones_reglas(db: Session = Depends(get_db)):
    return services.listar_versiones_reglas(db)

@router.get("/reglas/vigente", response_model=schemas.ReglasRotulado)
def read_reglas_vigentes(db: Session = Depends(get_db)):
    return services.obtener_reglas_vigentes(db)

@router.get("/reglas/{reglas_id}", response_model=schemas.ReglasRotulado)
def read_version_reglas(reglas_id: int, db: Session = Depends(get_db)):
    return services.leer_version_reglas(db, reglas_id)

@router.post("/reglas", response_model=schemas.ReglasRotulado)
def create_version_reglas(datos: schemas.ReglasRotuladoCreate, db: Session = Depends(get_db)):
    return services.crear_version_reglas(db, datos)

@router.get("/productos/{producto_id}", response_model=schemas.EvaluacionRotulado)
def read_rotulado_producto(producto_id: int, db: Session = Depends(get_db)):
    return services.obtener_rotulado_producto(db, producto_id)

@router.put("/productos/{producto_id}", response_model=schemas.EvaluacionRotulado)
def update_rotulado_producto(producto_id: int, datos: schemas.RotuladoProductoUpdate, db: Session = Depends(get_db)):
    return services.actualizar_rotulado_producto(db, producto_id, datos)
