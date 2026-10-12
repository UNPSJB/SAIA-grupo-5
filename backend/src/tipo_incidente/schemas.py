from pydantic import ConfigDict, BaseModel, Field
from typing import Annotated

class TipoIncidenteBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=30)]
    descripcion: Annotated[str | None, Field(max_length=400)] = None

class TipoIncidenteCreate(TipoIncidenteBase):
    pass

class TipoIncidenteUpdate(TipoIncidenteBase):
    pass

class TipoIncidente(TipoIncidenteBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)

