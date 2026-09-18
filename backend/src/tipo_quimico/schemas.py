from pydantic import ConfigDict, BaseModel, Field
from typing import Annotated 

class TipoQuimicoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=30)]

class TipoQuimicoCreate(TipoQuimicoBase):
    pass

class TipoQuimicoUpdate(TipoQuimicoBase):
    pass

class TipoQuimico(TipoQuimicoBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)

class TipoQuimicoDelete(TipoQuimicoBase):
    id: int
    