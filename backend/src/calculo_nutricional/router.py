import logging
from fastapi import Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.router_base import PermissionedRouter
from src.calculo_nutricional import schemas, services

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/calculo-nutricional", tags=["calculo_nutricional"])

@router.get("/configuracion", response_model=schemas.ConfiguracionCalculo)
def read_configuracion(db: Session = Depends(get_db)):
    return services.obtener_configuracion(db)

@router.put("/configuracion", response_model=schemas.ConfiguracionCalculo)
def update_configuracion(datos: schemas.ConfiguracionCalculoUpdate, db: Session = Depends(get_db)):
    return services.actualizar_configuracion(db, datos)

@router.get("/parametros", response_model=list[schemas.ParametroNutriente])
def read_parametros(db: Session = Depends(get_db)):
    return services.listar_parametros(db)

@router.put("/parametros/{parametro_id}", response_model=schemas.ParametroNutriente)
def update_parametro(parametro_id: int, datos: schemas.ParametroNutrienteUpdate, db: Session = Depends(get_db)):
    return services.actualizar_parametro(db, parametro_id, datos)

@router.post("/recetas/{receta_id}/calcular", response_model=schemas.InformacionNutricionalReceta)
def calcular_nutricion_receta(receta_id: int, db: Session = Depends(get_db)):
    return services.calcular_informacion_receta(db, receta_id)

@router.get("/recetas/{receta_id}", response_model=schemas.InformacionNutricionalReceta)
def read_nutricion_receta(receta_id: int, db: Session = Depends(get_db)):
    return services.leer_informacion_receta(db, receta_id)