from datetime import date, datetime
from typing import Optional, Annotated
from pydantic import BaseModel, ConfigDict, Field, model_validator
from src.lote_proveedor.constants import ErrorCode, EstadoLoteProveedor
from src.proveedor.schemas import Proveedor
from src.insumos_lote.schemas import InsumoLote
from src.pedidos_proveedor.schemas import PedidoProveedor

class PersonaSimple(BaseModel):
    id: int
    nombre: str
    apellido: str

    model_config = ConfigDict(from_attributes=True)


class LoteProveedorBase(BaseModel):
    proveedor_id: int 
    numero_remito: Annotated[str, Field(max_length=100)]
    fecha_recepcion: date
    archivo_adjunto: Optional[str] = None
    pedido_id: int

    @model_validator(mode="after")
    def validar_fecha_recepcion(self):
        if self.fecha_recepcion > date.today():
            raise ValueError(ErrorCode.FECHA_RECEPCION_FUTURA.value)
        return self


class LoteProveedorCreate(LoteProveedorBase):
    pass


class LoteProveedorUpdate(BaseModel):
    numero_remito: Annotated[str, Field(max_length=100)]
    fecha_recepcion: date
    archivo_adjunto: Optional[str] = None

    @model_validator(mode="after")
    def validar_fecha_recepcion(self):
        if self.fecha_recepcion > date.today():
            raise ValueError(ErrorCode.FECHA_RECEPCION_FUTURA.value)
        return self


class AvanzarEtapaLote(BaseModel):
    observacion: Annotated[Optional[str], Field(default=None, max_length=500)] = None

    model_config = ConfigDict(populate_by_name=True)


class LoteProveedor(LoteProveedorBase):
    id: int
    estado: EstadoLoteProveedor
    registrado_por_id: int
    fecha_registro: datetime
    activo: bool
    proveedor: Optional[Proveedor] = None
    pedido: Optional[PedidoProveedor] = None
    registrado_por: Optional[PersonaSimple] = None
    insumos: list[InsumoLote] = []

    model_config = ConfigDict(from_attributes=True)


class HistorialEstadoLoteProveedorResponse(BaseModel):
    id: int
    lote_id: int
    estado: str
    fecha_hora: datetime
    observacion: str | None = None
    usuario: PersonaSimple | None = None

    model_config = ConfigDict(from_attributes=True)