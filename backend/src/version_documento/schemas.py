from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import datetime, date

class PersonaBasica(BaseModel):
    nombre: str
    apellido: str
    model_config = ConfigDict(from_attributes=True)

class VersionDocumentoBase(BaseModel):
    documento_id: int
    archivo: str
    observacion: Annotated[str | None, Field(max_length=300)] = None

class VersionDocumentoCreate(VersionDocumentoBase):
    pass


class VersionDocumentoUpdate(VersionDocumentoBase):
    observacion: Annotated[str | None, Field(max_length=300)] = None

class VersionDocumento(VersionDocumentoBase):
    id: int
    version: int
    activo: bool
    vigente: bool
    fecha_desde_vigencia: datetime | None = None
    fecha_hasta_vigencia: datetime | None = None
    aprobador_id: int | None = None
    aprobador: PersonaBasica | None = None
    fecha_aprobacion: datetime | None = None
    fecha_subida: date
    
    model_config = ConfigDict(from_attributes=True)

class VersionDocumentoDelete(BaseModel):
    id: int