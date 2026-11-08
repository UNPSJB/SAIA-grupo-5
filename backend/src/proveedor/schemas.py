from datetime import date
from typing import Annotated
from pydantic import BaseModel, ConfigDict, EmailStr, Field


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


class Proveedor(ProveedorBase):
    id: int
    numero_habilitacion: str | None = None
    vencimiento_habilitacion: date | None = None
    observacion_habilitacion: str | None = None
    archivo_adjunto: str | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)