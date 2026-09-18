from pydantic import BaseModel, ConfigDict, Field, EmailStr, model_validator
from typing import Annotated, Optional
from src.personal.constants import Capacidades


class PersonaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=50)]
    apellido: Annotated[str, Field(min_length=1, max_length=50)]
    dni: Annotated[str, Field(min_length=1, max_length=20)]
    mail: EmailStr
    username: Annotated[str, Field(min_length=3, max_length=50)]
    operar: bool = False
    administrar: bool = False


class PersonaCreate(PersonaBase):
    password: Annotated[str, Field(min_length=4)]


class PersonaUpdate(BaseModel):
    nombre: Optional[Annotated[str, Field(min_length=1, max_length=50)]] = None
    apellido: Optional[Annotated[str, Field(min_length=1, max_length=50)]] = None
    dni: Optional[Annotated[str, Field(min_length=1, max_length=20)]] = None
    mail: Optional[EmailStr] = None
    operar: Optional[bool] = None
    administrar: Optional[bool] = None
    password: Optional[Annotated[str, Field(min_length=4)]] = None


class Persona(PersonaBase):
    id: int
    activo: bool
    capacidades: set[Capacidades]
    role_name: str
    role_id: int
    email: Optional[str] = None

    @model_validator(mode="after")
    def populate_email(self):
        if not self.email and self.mail:
            self.email = str(self.mail)
        return self

    model_config = ConfigDict(from_attributes=True)


class PersonaDelete(Persona):
    pass