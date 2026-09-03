from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated, Optional


class PersonaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=40)]
    operar: bool = False
    administrar: bool = False

class Persona(PersonaBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class PersonaCreate(PersonaBase):
    pass

class PersonaUpdate(PersonaBase):
    nombre: Optional[Annotated[str, Field(min_length=1, max_length=40)]] = None
    operar: Optional[bool] = None
    administrar:Optional [bool] = None

class PersonaDelete(Persona):
    pass  #creo que deberia ser solo pass?