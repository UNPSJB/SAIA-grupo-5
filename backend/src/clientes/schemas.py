from typing import List, Optional, Annotated
from pydantic import BaseModel, Field, ConfigDict
from src.direcciones_cliente.schemas import DireccionCliente


class ClienteBase(BaseModel):
    razon_social: Annotated[str, Field(min_length=3, max_length=100)]
    cuit: Annotated[str, Field(min_length=10, max_length=20)]
    telefono: Optional[str] = Annotated[str, Field(default=None, max_length=50)]
    email: Optional[str] = Annotated[str, Field(default=None, max_length=100)]


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(ClienteBase):
    pass


class Cliente(ClienteBase):
    id: int
    activo: bool
    direcciones: List[DireccionCliente] = []

    model_config = ConfigDict(from_attributes=True)