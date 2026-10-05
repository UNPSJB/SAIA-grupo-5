from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime

class VersionDocumentoBase(BaseModel):
    documento_id: int
    archivo: str
    fecha_desde_vigencia: datetime | None = None
    fecha_hasta_vigencia: datetime | None = None

class VersionDocumentoCreate(VersionDocumentoBase):
    pass

class VersionDocumentoUpdate(VersionDocumentoBase):
    vigente: bool

class VersionDocumento(VersionDocumentoBase):
    id: int
    version: int
    fecha_subida: date
    activo: bool
    vigente: bool
    
    model_config = ConfigDict(from_attributes=True)

class VersionDocumentoDelete(VersionDocumentoBase):
    id: int
