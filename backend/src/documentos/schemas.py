from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from src.tipo_documento.schemas import TipoDocumento

class DocumentoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=100)]
    descripcion: Annotated[str | None, Field(max_length=500)] = None
    tipo_id: int

class DocumentoCreate(DocumentoBase):
    pass

class DocumentoUpdate(DocumentoBase):
    pass

class Documento(DocumentoBase):
    id: int
    activo: bool
    tipo: TipoDocumento
    
    model_config = ConfigDict(from_attributes=True)

class DocumentoDelete(DocumentoBase):
    id: int
