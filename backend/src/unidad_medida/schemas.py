from pydantic import BaseModel, Field, ConfigDict
from typing import Annotated

class UnidadMedidaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=3, max_length=40)]

class UnidadMedidaCreate(UnidadMedidaBase):
    pass

class UnidadMedidaUpdate(UnidadMedidaBase):
    pass

class UnidadMedida(UnidadMedidaBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)