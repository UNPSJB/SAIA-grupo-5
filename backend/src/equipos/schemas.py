from pydantic import BaseModel, ConfigDict, EmailStr, Field

class EquipoBase(BaseModel):
    nombre: str
    categoria: str
    ubicacion: str


class EquipoCreate(EquipoBase):
    pass


class EquipoUpdate(BaseModel):
    # INLUIR UN exclude_unset=True EN LOS model.dump en services
    nombre: str | None = Field(default=None, min_length=1)
    categoria: str | None = None
    ubicacion: str | None = None


class Equipo(EquipoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)