from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Annotated
from src.sector.schemas import Sector as SectorSchema


class PlanLimpiezaMinimal(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)


class EquipoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=100)]
    categoria: Annotated[str, Field(default=None, max_length=100)]
    ubicacion: Annotated[str, Field(default=None, max_length=100)]
    plan_limpieza_id: int | None = None
    sector_id: int | None = None


class EquipoCreate(EquipoBase):
    pass


class EquipoUpdate(BaseModel):
    # INLUIR UN exclude_unset=True EN LOS model.dump en services
    nombre: str | None = None
    categoria: str | None = None
    ubicacion: str | None = None
    plan_limpieza_id: int | None = None
    sector_id: int | None = None


class Equipo(EquipoBase):
    id: int
    estado: bool
    sector: SectorSchema | None = None
    plan_limpieza: PlanLimpiezaMinimal | None = None

    model_config = ConfigDict(from_attributes=True)