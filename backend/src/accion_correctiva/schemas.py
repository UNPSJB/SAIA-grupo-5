from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import datetime


class PersonaBasica(BaseModel):
    nombre: str
    apellido: str

    model_config = ConfigDict(from_attributes=True)


class AccionCorrectivaBase(BaseModel):
    descripcion: Annotated[str, Field(min_length=1, max_length=500)]


class AccionCorrectivaCreate(AccionCorrectivaBase):
    incidente_id: int


class AccionCorrectivaUpdate(AccionCorrectivaBase):
    pass


class AccionCorrectiva(AccionCorrectivaBase):
    id: int
    fecha: datetime
    incidente_id: int
    persona_id: int
    persona: PersonaBasica
    activo: bool

    model_config = ConfigDict(from_attributes=True)
