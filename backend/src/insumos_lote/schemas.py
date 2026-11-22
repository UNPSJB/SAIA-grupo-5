from datetime import date
from decimal import Decimal
from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator
from src.insumos.schemas import Insumo
from src.insumos_lote import exceptions


class InsumoLoteBase(BaseModel):
    insumo_id: int
    marca: Annotated[str, Field(min_length=1, max_length=100)]
    cantidad: Annotated[int, Field(gt=0)]
    fecha_vencimiento: date
    costo_unitario: Annotated[Optional[Decimal], Field(ge=0)]= None
    minimo_alerta: Annotated[int, Field(ge=0)]
    numero_lote: Annotated[str, Field(min_length=1, max_length=100)]
    equipo_id: Optional[int] = None
    sector_id: Optional[int] = None

    @model_validator(mode="after")
    def validar_vencimiento_no_pasado(self):
        if self.fecha_vencimiento <= date.today():
            raise exceptions.FechaVencimientoInvalida()
        return self


class InsumoLoteCreate(InsumoLoteBase):
    pass


class ActualizarAlmacenamiento(BaseModel):
    equipo_id: Optional[int] = None
    sector_id: Optional[int] = None

class ProveedorResumen(BaseModel):
    id: int
    nombre: str
    cuit: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class LoteProveedorResumen(BaseModel):
    id: int
    numero_remito: Optional[str] = None
    proveedor: Optional[ProveedorResumen] = None

    model_config = ConfigDict(from_attributes=True)

class ProduccionResumen(BaseModel):
    id: int
    fecha_produccion: date
    estado: str
    cantidad_producida: int

    model_config = ConfigDict(from_attributes=True)

class InsumoUtilizadoResumen(BaseModel):
    id: int
    cantidad_utilizada: Decimal
    lote_produccion: ProduccionResumen

    model_config = ConfigDict(from_attributes=True)

class SectorAlmacenamientoResumen(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)


class EquipoAlmacenamientoResumen(BaseModel):
    id: int
    nombre: str
    ubicacion: Optional[str] = None
    sector: Optional[SectorAlmacenamientoResumen] = None

    model_config = ConfigDict(from_attributes=True)


class InsumoLote(InsumoLoteBase):
    id: int
    lote_proveedor_id: int
    cantidad_restante: int
    activo: bool
    insumo: Insumo
    lote_proveedor: Optional[LoteProveedorResumen] = None
    equipo: Optional[EquipoAlmacenamientoResumen] = None
    sector: Optional[SectorAlmacenamientoResumen] = None
    producciones_asociadas: list[InsumoUtilizadoResumen] = []

    model_config = ConfigDict(from_attributes=True)


class TrazabilidadEnvioAfectado(BaseModel):
    envio_id: int
    numero_remito: str
    fecha_envio: date
    estado: str
    cantidad: int
    cliente_id: int
    cliente_razon_social: str
    cliente_cuit: str
    direccion: str


class TrazabilidadProduccionAfectada(BaseModel):
    lote_produccion_id: int
    producto_nombre: str
    fecha_produccion: date
    fecha_vencimiento: date
    estado: str
    cantidad_producida: int
    cantidad_utilizada: Decimal
    unidad_medida: str
    envios: list[TrazabilidadEnvioAfectado] = []


class TrazabilidadInsumoLote(BaseModel):
    insumo_lote_id: int
    insumo_nombre: str
    marca: str
    numero_lote_insumo: str
    fecha_vencimiento: date
    cantidad: int
    cantidad_restante: int
    unidad_medida: str
    lote_proveedor_id: Optional[int] = None
    numero_remito: Optional[str] = None
    fecha_recepcion: Optional[date] = None
    proveedor_id: Optional[int] = None
    proveedor_nombre: Optional[str] = None
    proveedor_cuit: Optional[str] = None
    producciones: list[TrazabilidadProduccionAfectada] = []