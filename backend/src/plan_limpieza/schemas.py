from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated

class SectorMinimal(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)

class PlanLimpiezaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=60)]
    descripcion: Annotated[str | None, Field(max_length=255)] = None

class PlanLimpiezaCreate(PlanLimpiezaBase):
    pass

class PlanLimpiezaUpdate(PlanLimpiezaBase):
    pass

class PlanLimpieza(PlanLimpiezaBase):
    id: int
    sectores: list[SectorMinimal]

    model_config = ConfigDict(from_attributes=True)

class PlanLimpiezaDelete(PlanLimpiezaBase):
    id: int
