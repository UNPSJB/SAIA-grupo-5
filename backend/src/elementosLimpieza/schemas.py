from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated


class TipoElementoLimpiezaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=100)]
    prefijo: Annotated[str, Field(min_length=1, max_length=10)]


class TipoElementoLimpiezaCreate(TipoElementoLimpiezaBase):
    pass


class TipoElementoLimpiezaUpdate(BaseModel):
    nombre: Annotated[str | None, Field(default=None, min_length=1, max_length=100)]


class TipoElementoLimpieza(TipoElementoLimpiezaBase):
    id: int
    estado: bool

    model_config = ConfigDict(from_attributes=True)


class ElementoLimpiezaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=100)]
    tipo: int
    material: Annotated[str | None, Field(default=None, max_length=100)]
    ubicacion: Annotated[str | None, Field(default=None, max_length=100)]
    frecuencia_recambio: Annotated[int | None, Field(default=None, gt=0)]


class ElementoLimpiezaCreate(ElementoLimpiezaBase):
    pass


class ElementoLimpiezaUpdate(BaseModel):
    nombre: Annotated[str | None, Field(default=None, min_length=1, max_length=100)]
    material: Annotated[str | None, Field(default=None, max_length=100)]
    ubicacion: Annotated[str | None, Field(default=None, max_length=100)]
    frecuencia_recambio: Annotated[int | None, Field(default=None, gt=0)]


class ElementoLimpieza(ElementoLimpiezaBase):
    id: int
    codigo: str
    estado: bool

    model_config = ConfigDict(from_attributes=True)