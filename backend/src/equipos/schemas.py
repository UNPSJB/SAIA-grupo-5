from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Annotated


class EquipoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=100)]
    categoria: Annotated[str, Field(min_length=1, max_length=100)]
    ubicacion: Annotated[str, Field(min_length=1, max_length=100)]


class EquipoCreate(EquipoBase):
    pass


class EquipoUpdate(BaseModel):
    # INLUIR UN exclude_unset=True EN LOS model.dump en services
    nombre: str | None = None
    categoria: str | None = None
    ubicacion: str | None = None


class Equipo(EquipoBase):
    id: int
    estado: bool

    model_config = ConfigDict(from_attributes=True)