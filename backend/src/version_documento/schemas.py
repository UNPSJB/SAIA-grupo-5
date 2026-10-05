from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import datetime

class PersonaBasica(BaseModel):
    nombre: str
    apellido: str
    model_config = ConfigDict(from_attributes=True)

class VersionDocumentoBase(BaseModel):
    version: Annotated[int, Field(gt=0)]
    documento_id: int
    fecha_subida: datetime
    archivo: str

class VersionDocumentoCreate(VersionDocumentoBase):
    pass

class VersionDocumentoUpdate(BaseModel):

    archivo: str | None = None

class VersionDocumento(VersionDocumentoBase):
    id: int
    activo: bool
    vigente: bool
    fecha_desde_vigencia: datetime | None = None
    fecha_hasta_vigencia: datetime | None = None
    aprobador_id: int | None = None
    aprobador: PersonaBasica | None = None
    fecha_aprobacion: datetime | None = None
    model_config = ConfigDict(from_attributes=True)

class VersionDocumentoDelete(BaseModel):
    id: int