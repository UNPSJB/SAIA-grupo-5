import logging
from typing import List
from fastapi import Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.auth.dependencies import tiene_permiso_operar
from src.auth.router_base import PermissionedRouter
from src.envios_lote import schemas, services
from src.personal.models import Persona

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/envios-lote", tags=["envios_lote"])

@router.get("/proximo-remito")
def obtener_proximo_remito(db: Session = Depends(get_db), _: Persona = Depends(tiene_permiso_operar)):
    return {"proximo_remito": services.generar_siguiente_remito(db)}


@router.post("/", response_model=schemas.EnvioLote, dependencies=[Depends(tiene_permiso_operar)])
def create_envio(datos: schemas.EnvioLoteCreate, db: Session = Depends(get_db)):
    return services.crear_envio(db=db, datos=datos)


@router.patch("/{envio_id}/recepcion", response_model=schemas.EnvioLote, dependencies=[Depends(tiene_permiso_operar)])
def update_recepcion_envio(envio_id: int,datos: schemas.EnvioLoteUpdate,db: Session = Depends(get_db)):
    return services.registrar_recepcion_envio(db=db, envio_id=envio_id, datos=datos)


@router.get("/lote/{lote_id}", response_model=List[schemas.EnvioLote])
def read_envios_por_lote(lote_id: int, db: Session = Depends(get_db)):
    return services.listar_envios_por_lote(db=db, lote_id=lote_id)


@router.get("/{envio_id}", response_model=schemas.EnvioLote)
def read_envio(envio_id: int, db: Session = Depends(get_db)):
    return services.leer_envio(db=db, envio_id=envio_id)
