from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated

class SectorBase(BaseModel):
    nombre: Annotated[str , Field(min_length=1, max_length=40)]

class SectorCreate(SectorBase):
    pass

class SectorUpdate(SectorBase):
    pass

class Sector(SectorBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)

class SectorDelete(SectorBase):
    id: int