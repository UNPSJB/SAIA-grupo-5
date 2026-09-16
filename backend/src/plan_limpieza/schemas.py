from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated

class PlanLimpiezaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=60)]
    descripcion: Annotated[str | None, Field(max_length=255)] = None

class PlanLimpiezaCreate(PlanLimpiezaBase):
    pass

class PlanLimpiezaUpdate(PlanLimpiezaBase):
    pass

class PlanLimpieza(PlanLimpiezaBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class PlanLimpiezaDelete(PlanLimpiezaBase):
    id: int
