from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated

class SuperficieBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=60)]
    tipo_contacto: Annotated[str, Field(min_length=1, max_length=20)]

class SuperficieCreate(SuperficieBase):
    pass

class SuperficieUpdate(SuperficieBase):
    pass

class Superficie(SuperficieBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)

class SuperficieDelete(SuperficieBase):
    id: int
