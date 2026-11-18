import logging
from fastapi import Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.dependencies import get_current_persona
from src.auth.router_base import PermissionedRouter
from src.fuente_nutricional import schemas, services

logger = logging.getLogger(__name__)

router = PermissionedRouter(prefix="/fuentes-nutricionales", tags=["fuentes_nutricionales"])

@router.post("/", response_model=schemas.FuenteNutricional)
def create_fuente_nutricional(fuente_nutricional: schemas.FuenteNutricionalCreate, db: Session = Depends(get_db)):
    return services.crear_fuente_nutricional(db, fuente_nutricional)

@router.get("/", response_model=list[schemas.FuenteNutricional])
def read_fuentes_nutricionales(db: Session = Depends(get_db)):
    return services.listar_fuentes_nutricionales(db)

@router.get("/alimentos-referencia/", response_model=list[schemas.AlimentoReferencia])
def read_alimentos_referencia(fuente_id: int | None = Query(default=None), q: str | None = Query(default=None), db: Session = Depends(get_db)):
    return services.leer_alimentos_referencia(db, fuente_id, q)

@router.get("/{fuente_nutricional_id}", response_model=schemas.FuenteNutricional)
def read_fuente_nutricional(fuente_nutricional_id: int, db: Session = Depends(get_db)):
    return services.leer_fuente_nutricional(db, fuente_nutricional_id)

@router.put("/{fuente_nutricional_id}", response_model=schemas.FuenteNutricional)
def update_fuente_nutricional(fuente_nutricional_id: int, fuente_nutricional: schemas.FuenteNutricionalUpdate, db: Session = Depends(get_db)):
    return services.modificar_fuente_nutricional(db, fuente_nutricional_id, fuente_nutricional)

@router.patch("/{fuente_nutricional_id}/estado", response_model=schemas.FuenteNutricional)
def cambiar_estado_fuente_nutricional(fuente_nutricional_id: int, db: Session = Depends(get_db)):
    return services.cambiar_estado_fuente_nutricional(db, fuente_nutricional_id)

@router.patch("/{fuente_nutricional_id}/verificada", response_model=schemas.FuenteNutricional)
def verificar_fuente_nutricional(fuente_nutricional_id: int, persona=Depends(get_current_persona), db: Session = Depends(get_db)):
    return services.verificar_fuente_nutricional(db, fuente_nutricional_id, persona)

@router.post("/{fuente_nutricional_id}/importar-csv")
async def importar_alimentos_desde_csv(fuente_nutricional_id: int, archivo: UploadFile = File(...), db: Session = Depends(get_db)):
    contenido = await archivo.read()
    return services.importar_csv_sara(db, fuente_nutricional_id, contenido)

