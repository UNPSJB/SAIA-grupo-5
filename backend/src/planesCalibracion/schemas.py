from datetime import date
from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated


class PlanCalibracionBase(BaseModel):
    periodicidad: Annotated[int, Field(gt=0)]


class PlanCalibracionCreate(PlanCalibracionBase):
    equipo_id: int
    fecha_inicio: date | None = None


class PlanCalibracionUpdate(BaseModel):
    periodicidad: Annotated[int | None, Field(default=None, gt=0)]


class PlanCalibracion(PlanCalibracionBase):
    id: int
    equipo_id: int
    fecha_inicio: date
    estado: bool
    proxima_fecha: date | None = None
    dias_restantes: int | None = None

    model_config = ConfigDict(from_attributes=True)