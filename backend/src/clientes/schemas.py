from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ClienteBase(BaseModel):
    dni: int
    nombre: str = Field(pattern=r"^[a-zA-Z]+$")
    apellido: str = Field(pattern=r"^[a-zA-Z]+$")
    email: EmailStr
    telefono: str = Field(pattern=r"^[0-9-]+$")


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    dni: int | None = None
    nombre: str | None = Field(default=None, pattern=r"^[a-zA-Z]+$")
    apellido: str | None = Field(default=None, pattern=r"^[a-zA-Z]+$")
    email: EmailStr | None = None
    telefono: str | None = Field(default=None, pattern=r"^[0-9-]+$")


class Cliente(ClienteBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)