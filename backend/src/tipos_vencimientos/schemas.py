from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated

class TipoVencimientoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=3, max_length=40)]
    descripcion: Annotated[str  | None, Field(default=None, min_length=5, max_length=500)] = None

class TipoVencimientoCreate(TipoVencimientoBase):
    pass

class TipoVencimientoUpdate(TipoVencimientoBase):
    pass

class TipoVencimiento(TipoVencimientoBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)


