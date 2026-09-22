from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated

class SectorMinimal(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)

class SuperficieMinimal(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)

class EquipoMinimal(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)

class PlanLimpiezaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=60)]
    descripcion: Annotated[str | None, Field(max_length=500)] = None

class PlanLimpiezaCreate(PlanLimpiezaBase):
    sector_ids: list[int] = []
    superficie_ids: list[int] = []

class PlanLimpiezaUpdate(PlanLimpiezaBase):
    sector_ids: list[int] = []
    superficie_ids: list[int] = []

class PlanLimpieza(PlanLimpiezaBase):
    id: int
    activo: bool
    sectores: list[SectorMinimal] = []
    superficies: list[SuperficieMinimal] = []
    equipos: list[EquipoMinimal] = []

    model_config = ConfigDict(from_attributes=True)

class PlanLimpiezaDelete(PlanLimpiezaBase):
    id: int
