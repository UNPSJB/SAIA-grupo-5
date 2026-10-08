from datetime import date
from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated


class RegistroCalibracionBase(BaseModel):
    observacion: Annotated[str | None, Field(default=None, max_length=255)]


class RegistroCalibracionCreate(RegistroCalibracionBase):
    fecha: date | None = None


class RegistroCalibracion(RegistroCalibracionBase):
    id: int
    plan_calibracion_id: int
    fecha: date

    model_config = ConfigDict(from_attributes=True)