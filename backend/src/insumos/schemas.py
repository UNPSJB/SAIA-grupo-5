from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated

class InsumoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=40)]      # Esto hace que como minimo el nombre debe tener 1 caracter para cumplir con el criterio de aceptacion
    unidad_medida: Annotated[str, Field(min_length=1, max_length=20)]

class InsumoCreate(InsumoBase):
    pass

class InsumoUpdate(InsumoBase):
    pass

class Insumo(InsumoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class InsumoDelete(InsumoBase):
    id: int

