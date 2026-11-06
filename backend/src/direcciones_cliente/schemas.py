from typing import Optional, Annotated
from pydantic import BaseModel, Field, ConfigDict


class DireccionClienteBase(BaseModel):
    calle_altura: Annotated[str, Field(min_length=3, max_length=150)]
    descripcion: Optional[str] = Annotated[str, Field(default=None, max_length=100)]


class DireccionClienteCreate(DireccionClienteBase):
    cliente_id: int


class DireccionClienteUpdate(DireccionClienteBase):
    pass


class DireccionCliente(DireccionClienteBase):
    id: int
    cliente_id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)