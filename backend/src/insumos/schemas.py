from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from src.unidad_medida.schemas import UnidadMedida

class InsumoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=3, max_length=40)]      # Esto hace que como minimo el nombre debe tener 1 caracter para cumplir con el criterio de aceptacion
    unidad_medida_id: int

class InsumoCreate(InsumoBase):
    pass

class InsumoUpdate(InsumoBase):
    pass

class Insumo(InsumoBase):
    id: int
    activo: bool
    unidad_medida: UnidadMedida

    model_config = ConfigDict(from_attributes=True)

class InsumoDelete(InsumoBase):
    id: int

