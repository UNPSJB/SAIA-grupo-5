from pydantic import ConfigDict, BaseModel, Field
from typing import Annotated, Optional

class TipoQuimicoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=3, max_length=30)]

class TipoQuimicoCreate(TipoQuimicoBase):
    descripcion: Optional[str] = None

class TipoQuimicoUpdate(TipoQuimicoBase):
    descripcion: Optional[str] = None

class TipoQuimico(TipoQuimicoBase):
    id: int
    activo: bool
    descripcion: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TipoQuimicoDelete(TipoQuimicoBase):
    id: int