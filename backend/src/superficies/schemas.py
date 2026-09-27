from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated


class SectorMinimal(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)


class SuperficieBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=120)]
    tipo_contacto: Annotated[str, Field(min_length=1, max_length=20)]


class SuperficieCreate(SuperficieBase):
    sector_ids: list[int] = []


class SuperficieUpdate(SuperficieBase):
    sector_ids: list[int] = []


class Superficie(SuperficieBase):
    id: int
    activo: bool
    sectores: list[SectorMinimal] = []

    model_config = ConfigDict(from_attributes=True)


class SuperficieDelete(SuperficieBase):
    id: int
