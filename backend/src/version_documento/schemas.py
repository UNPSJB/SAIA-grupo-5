from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import date, datetime

class VersionDocumentoBase(BaseModel):
    version: int
    documento_id: int
    fecha_subida: datetime
    archivo: str
    fecha_desde_vigencia: datetime
    fecha_hasta_vigencia: datetime | None = None

class VersionDocumentoCreate(VersionDocumentoBase):
    pass

class VersionDocumentoUpdate(VersionDocumentoBase):
    pass

class VersionDocumento(VersionDocumentoBase):
    id: int
    #activo: bool
    vigente: bool
    
    model_config = ConfigDict(from_attributes=True)

class VersionDocumentoDelete(VersionDocumentoBase):
    id: int
