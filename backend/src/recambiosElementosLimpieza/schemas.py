from datetime import date
from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated


class RecambioElementoLimpiezaBase(BaseModel):
    observacion: Annotated[str | None, Field(default=None, max_length=255)]


class RecambioElementoLimpiezaCreate(RecambioElementoLimpiezaBase):
    fecha: date | None = None


class RecambioElementoLimpieza(RecambioElementoLimpiezaBase):
    id: int
    elemento_id: int
    fecha: date

    model_config = ConfigDict(from_attributes=True)