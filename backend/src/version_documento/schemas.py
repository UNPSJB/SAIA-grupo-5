from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import date, datetime

class VersionDocumentoBase(BaseModel):
    version: Annotated[int, Field(gt=0)]
    documento_id: int
    fecha_subida: datetime
    archivo: str
    fecha_desde_vigencia: datetime | None = None
    fecha_hasta_vigencia: datetime | None = None

class VersionDocumentoCreate(VersionDocumentoBase):
    pass

class VersionDocumentoUpdate(VersionDocumentoBase):
    vigente: bool

class VersionDocumento(VersionDocumentoBase):
    id: int
    activo: bool
    vigente: bool
    
    model_config = ConfigDict(from_attributes=True)

class VersionDocumentoDelete(VersionDocumentoBase):
    id: int
