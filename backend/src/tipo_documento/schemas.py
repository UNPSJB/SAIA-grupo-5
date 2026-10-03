from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated

class TipoDocumentoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=60)]
    descripcion: Annotated[str | None, Field(max_length=100)] = None


class TipoDocumentoCreate(TipoDocumentoBase):
    pass

class TipoDocumentoUpdate(TipoDocumentoBase):
    pass

class TipoDocumento(TipoDocumentoBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)


