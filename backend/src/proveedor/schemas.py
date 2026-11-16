from datetime import date
from typing import Annotated
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from src.insumos.schemas import Insumo


class ProveedorBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=150)]
    cuit: Annotated[str, Field(min_length=11, max_length=20)]
    telefono: Annotated[str | None, Field(default=None, max_length=40)] = None
    email: EmailStr | None = None


class ProveedorCreate(ProveedorBase):
    pass


class ProveedorUpdate(ProveedorBase):
    pass


class ProveedorRenovarHabilitacion(BaseModel):
    numero_habilitacion: Annotated[str, Field(min_length=1, max_length=100)]
    vencimiento_habilitacion: date
    observacion_habilitacion: Annotated[str | None, Field(default=None, max_length=500)] = None
    archivo_adjunto: str | None = None


class ProveedorInsumosUpdate(BaseModel):
    insumos_ids: list[int]


class ProveedorInsumo(BaseModel):
    id: int
    proveedor_id: int
    insumo_id: int
    insumo: Insumo

    model_config = ConfigDict(from_attributes=True)

class Proveedor(ProveedorBase):
    id: int
    numero_habilitacion: str | None = None
    vencimiento_habilitacion: date | None = None
    observacion_habilitacion: str | None = None
    archivo_adjunto: str | None = None
    insumos_asociados: list[ProveedorInsumo] = []
    activo: bool

    model_config = ConfigDict(from_attributes=True)