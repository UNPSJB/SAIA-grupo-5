import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.unidad_medida import schemas, services
from src.auth.router_base import PermissionedRouter

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/unidades-medida", tags=["unidades_medida"])


@router.post("/", response_model=schemas.UnidadMedida)
def create_unidad_medida(unidad_medida: schemas.UnidadMedidaCreate, db: Session = Depends(get_db)):
    return services.crear_unidad_medida(db, unidad_medida)


@router.get("/", response_model=list[schemas.UnidadMedida])
def read_unidades_medida(db: Session = Depends(get_db)):
    return services.listar_unidad_medida(db)


@router.get("/{unidad_medida_id}", response_model=schemas.UnidadMedida)
def read_unidad_medida(unidad_medida_id: int, db: Session = Depends(get_db)):
    return services.leer_unidad_medida(db, unidad_medida_id)


@router.put("/{unidad_medida_id}", response_model=schemas.UnidadMedida)
def update_unidad_medida(unidad_medida_id: int, unidad_medida: schemas.UnidadMedidaUpdate, db: Session = Depends(get_db)):
    return services.modificar_unidad_medida(db, unidad_medida_id, unidad_medida)


@router.patch("/{unidad_medida_id}/estado", response_model=schemas.UnidadMedida)
def cambiar_estado_unidad_medida(unidad_medida_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_unidad_medida(db, unidad_medida_id)