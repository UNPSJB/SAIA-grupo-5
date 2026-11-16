from datetime import date, datetime
from typing import Optional, Annotated
from pydantic import BaseModel, ConfigDict, Field
from src.clientes.schemas import Cliente
from src.direcciones_cliente.schemas import DireccionCliente


class EnvioLoteBase(BaseModel):
    lote_id: int
    cliente_id: int
    direccion_cliente_id: int
    cantidad: int
    numero_remito: Annotated[str, Field(max_length=50)] = None
    transportista: Annotated[str, Field(max_length=100)]
    fecha_envio: date


class EnvioLoteCreate(EnvioLoteBase):
    pass


class EnvioLoteUpdate(BaseModel):
    recibido: bool
    fecha_entrega: Optional[date] = None
    observaciones: Annotated[Optional[str], Field(max_length=500)] = None


class EnvioLote(EnvioLoteBase):
    id: int
    estado: str
    fecha_entrega: Optional[date] = None
    observaciones: Optional[str] = None

    cliente: Cliente
    direccion: DireccionCliente

    model_config = ConfigDict(from_attributes=True)