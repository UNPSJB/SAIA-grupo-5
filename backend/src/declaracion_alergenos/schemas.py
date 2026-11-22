from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field
from src.declaracion_alergenos.constants import EstadoDeclaracion
from src.personal.schemas import Persona

class AlergenoDetectado(BaseModel):
    alergeno_id: int
    nombre: str
    es_derivado: bool
    es_tacc: bool

class ContaminacionCruzadaItem(BaseModel):
    alergeno_id: int
    es_derivado: bool = False

class ContaminacionCruzadaDetalle(BaseModel):
    alergeno_id: int
    nombre: str
    es_derivado: bool

class DeclaracionAlergenosUpdate(BaseModel):
    contaminacion_cruzada: list[ContaminacionCruzadaItem] = []
    condiciones_conservacion: Annotated[str | None, Field(default=None, max_length=500)] = None

class DeclaracionAlergenos(BaseModel):
    id: int
    receta_id: int

    alergenos_detectados: list[AlergenoDetectado]
    texto_alergenos: str | None = None

    contiene_gluten: bool
    texto_gluten: str

    contaminacion_cruzada: list[ContaminacionCruzadaDetalle]
    texto_contaminacion_cruzada: str | None = None

    condiciones_conservacion: str | None = None

    estado: EstadoDeclaracion
    confirmada_por_id: int | None = None
    fecha_confirmacion: datetime | None = None
    confirmada_por: Persona | None = None

    model_config = ConfigDict(from_attributes=True)

