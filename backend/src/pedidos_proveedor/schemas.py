from datetime import date, datetime
from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field
from src.pedidos_proveedor.constants import EstadoPedidoProveedor
from src.proveedor.schemas import Proveedor
from src.insumos.schemas import Insumo


class PersonaSimple(BaseModel):
    id: int
    nombre: str
    apellido: str

    model_config = ConfigDict(from_attributes=True)


class PedidoProveedorItemBase(BaseModel):
    insumo_id: int
    cantidad_pedida: Annotated[float, Field(gt=0)]


class PedidoProveedorItemCreate(PedidoProveedorItemBase):
    pass


class PedidoProveedorItem(PedidoProveedorItemBase):
    id: int
    pedido_id: int
    insumo: Optional[Insumo] = None

    model_config = ConfigDict(from_attributes=True)


class PedidoProveedorBase(BaseModel):
    proveedor_id: int
    fecha_entrega_estimada: Optional[date] = None
    observacion: Annotated[Optional[str], Field(default=None, max_length=500)] = None


class PedidoProveedorCreate(PedidoProveedorBase):
    items: list[PedidoProveedorItemCreate]


class PedidoProveedorUpdate(BaseModel):
    fecha_entrega_estimada: Optional[date] = None
    observacion: Annotated[Optional[str], Field(default=None, max_length=500)] = None
    items: list[PedidoProveedorItemCreate]


class PedidoProveedor(PedidoProveedorBase):
    id: int
    fecha_pedido: date
    estado: EstadoPedidoProveedor
    registrado_por_id: int
    fecha_registro: datetime
    proveedor: Optional[Proveedor] = None
    registrado_por: Optional[PersonaSimple] = None
    items: list[PedidoProveedorItem] = []
    activo: bool

    model_config = ConfigDict(from_attributes=True)