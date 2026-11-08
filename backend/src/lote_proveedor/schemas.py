from datetime import date, datetime
from typing import Optional, Annotated
from pydantic import BaseModel, ConfigDict, Field, model_validator
from src.lote_proveedor.constants import ErrorCode, EstadoLoteProveedor
from src.proveedor.schemas import Proveedor


class PersonaSimple(BaseModel):
    id: int
    nombre: str
    apellido: str

    model_config = ConfigDict(from_attributes=True)


class LoteProveedorBase(BaseModel):
    proveedor_id: int 
    numero_lote: Annotated[str, Field(min_length=1, max_length=100)]
    numero_remito: Annotated[Optional[str], Field(default=None, max_length=100)] = None
    fecha_recepcion: date
    archivo_adjunto: Optional[str] = None

    @model_validator(mode="after")
    def validar_fecha_recepcion(self):
        if self.fecha_recepcion > date.today():
            raise ValueError(ErrorCode.FECHA_RECEPCION_FUTURA.value)
        return self


class LoteProveedorCreate(LoteProveedorBase):
    pass


class LoteProveedorUpdate(BaseModel):
    numero_lote: Annotated[str, Field(min_length=1, max_length=100)]
    numero_remito: Annotated[Optional[str], Field(default=None, max_length=100)] = None
    fecha_recepcion: date
    archivo_adjunto: Optional[str] = None
    observaciones: Annotated[Optional[str], Field(default=None, max_length=500)] = None

    @model_validator(mode="after")
    def validar_fecha_recepcion(self):
        if self.fecha_recepcion > date.today():
            raise ValueError(ErrorCode.FECHA_RECEPCION_FUTURA.value)
        return self


class AvanzarEtapaLote(BaseModel):
    observaciones: Annotated[Optional[str], Field(default=None, max_length=500)] = None


class LoteProveedor(LoteProveedorBase):
    id: int
    estado: EstadoLoteProveedor
    observaciones: Optional[str] = None
    registrado_por_id: int
    fecha_registro: datetime
    activo: bool
    proveedor: Optional[Proveedor] = None
    registrado_por: Optional[PersonaSimple] = None

    model_config = ConfigDict(from_attributes=True)