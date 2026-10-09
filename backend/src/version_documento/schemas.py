from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import date, datetime

class VersionDocumentoBase(BaseModel):
    documento_id: int
    archivo: str
    observacion: Annotated[str | None, Field(max_length=300)] = None
    fecha_desde_vigencia: datetime | None = None
    fecha_hasta_vigencia: datetime | None = None

class VersionDocumentoCreate(VersionDocumentoBase):
    pass

class VersionDocumentoUpdate(VersionDocumentoBase):
    observacion: Annotated[str | None, Field(max_length=300)] = None

class VersionDocumento(VersionDocumentoBase):
    id: int
    version: int
    activo: bool
    vigente: bool
    fecha_subida: date
    
    model_config = ConfigDict(from_attributes=True)

class VersionDocumentoDelete(VersionDocumentoBase):
    id: int
