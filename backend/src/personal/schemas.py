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
    supervisor: bool = False


class PersonaCreate(PersonaBase):
    password: Annotated[str, Field(min_length=4)]


class PersonaUpdate(BaseModel):
    nombre: Optional[Annotated[str, Field(min_length=1, max_length=50)]] = None
    apellido: Optional[Annotated[str, Field(min_length=1, max_length=50)]] = None
    dni: Optional[Annotated[str, Field(min_length=1, max_length=20)]] = None
    mail: Optional[EmailStr] = None
    operar: Optional[bool] = None
    administrar: Optional[bool] = None
    supervisor: Optional[bool] = None
    password: Optional[Annotated[str, Field(min_length=4)]] = None


class CuentaUpdate(BaseModel):
    """Datos que una persona puede modificar de su propia cuenta."""

    nombre: Optional[Annotated[str, Field(min_length=1, max_length=50)]] = None
    apellido: Optional[Annotated[str, Field(min_length=1, max_length=50)]] = None
    mail: Optional[EmailStr] = None
    password_actual: Optional[str] = None
    password: Optional[Annotated[str, Field(min_length=4)]] = None

    @model_validator(mode="after")
    def password_actual_requerida(self):
        if self.password and not self.password_actual:
            raise ValueError("Debe indicar la contraseña actual para cambiarla")
        return self


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