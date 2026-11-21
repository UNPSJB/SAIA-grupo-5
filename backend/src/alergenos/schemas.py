from pydantic import ConfigDict, BaseModel, Field
from typing import Annotated, Optional
from src.insumos.schemas import Insumo


class AlergenoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=2, max_length=100)]
    descripcion: Annotated[str | None, Field(default=None, min_length=5, max_length=500)] = None
    es_tacc: bool = False

class AlergenoCreate(AlergenoBase):
    pass

class AlergenoUpdate(AlergenoBase):
    pass

class Alergeno(AlergenoBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)

class InsumoAlergenoItem(BaseModel):
    alergeno_id: int
    es_derivado: bool = False

class InsumoAlergenosUpdate(BaseModel):
    contiene_gluten: bool = False
    alergenos: list[InsumoAlergenoItem] = []

class InsumoAlergeno(BaseModel):
    id: int
    insumo_id: int
    alergeno_id: int
    es_derivado: bool
    alergeno: Alergeno

    model_config = ConfigDict(from_attributes=True)

class InsumoAlergenosResponse(BaseModel):
    insumo_id: int
    contiene_gluten: bool 
    alergenos: list[InsumoAlergeno]

    model_config = ConfigDict(from_attributes=True)

