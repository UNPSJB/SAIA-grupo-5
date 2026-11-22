from datetime import date
from fastapi import Depends
from sqlalchemy.orm import Session
from src.auth.dependencies import get_current_persona, tiene_permiso_operar_o_supervisor
from src.auth.router_base import PermissionedRouter
from src.database import get_db
from src.equipos import schemas as equipo_schemas
from src.personal import models as personal_models
from src.registro_temperatura import schemas, services

router = PermissionedRouter(prefix="/registros-temperatura", tags=["registros-temperatura"])


@router.post("/", response_model=schemas.RegistroTemperaturaResultado, dependencies=[Depends(tiene_permiso_operar_o_supervisor)])
def create_registro_temperatura(datos: schemas.RegistroTemperaturaCreate, db: Session = Depends(get_db), persona_actual: personal_models.Persona = Depends(get_current_persona)):
    return services.registrar_temperatura(db, datos, persona_actual)


@router.get("/pendientes-hoy", response_model=list[equipo_schemas.Equipo])
def read_equipos_pendientes_hoy(db: Session = Depends(get_db)):
    return services.listar_equipos_pendientes_hoy(db)


@router.get("/equipo/{equipo_id}", response_model=list[schemas.RegistroTemperatura])
def read_registros_por_equipo(equipo_id: int, solo_alertas: bool = False, fecha_desde: date | None = None, fecha_hasta: date | None = None, db: Session = Depends(get_db)):
    return services.listar_registros_por_equipo(db, equipo_id=equipo_id, solo_alertas=solo_alertas, fecha_desde=fecha_desde, fecha_hasta=fecha_hasta)
