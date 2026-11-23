from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field
from src.producto.schemas import Producto
from src.insumos_lote.schemas import (
    EquipoAlmacenamientoResumen,
    InsumoLote,
    SectorAlmacenamientoResumen,
)
from src.lote_produccion.models import EstadoLote
from src.personal.schemas import Persona


class LoteProduccionBase(BaseModel):
    producto_id: int
    fecha_produccion: date
    fecha_vencimiento: date
    cantidad_producida: Annotated[int, Field(gt=0)]
    equipo_id: Optional[int] = None
    sector_id: Optional[int] = None


class LoteProduccionCreate(LoteProduccionBase):
    pass


class LoteProduccionUpdate(LoteProduccionBase):
    pass


class LoteProduccion(LoteProduccionBase):
    id: int
    estado: EstadoLote
    activo: bool
    producto: Producto
    cantidad_disponible: int
    equipo: Optional[EquipoAlmacenamientoResumen] = None
    sector: Optional[SectorAlmacenamientoResumen] = None
    pasos_pendientes: int = 0
    checklist_completo: bool = True

    model_config = ConfigDict(from_attributes=True)


class LoteProduccionHistorial(BaseModel):
    lotes: list[LoteProduccion]
    total_producido: int | None = None


class EstadisticaProduccion(BaseModel):
    producto_id: int
    producto_nombre: str
    fecha: date
    cantidad: int


class InsumoUtilizadoCreate(BaseModel):
    insumo_lote_id: int
    cantidad_utilizada: Decimal = Field(gt=0, max_digits=12, decimal_places=3)


class InsumosUtilizadosCreate(BaseModel):
    insumos: list[InsumoUtilizadoCreate] = Field(min_length=1)


class InsumosUtilizadosUpdate(BaseModel):
    insumos: list[InsumoUtilizadoCreate]


class InsumoUtilizado(BaseModel):
    id: int
    lote_produccion_id: int
    insumo_lote_id: int
    cantidad_utilizada: Decimal
    insumo_lote: InsumoLote

    model_config = ConfigDict(from_attributes=True)


class LoteProduccionDetalle(LoteProduccion):
    insumos_utilizados: list[InsumoUtilizado] = Field(default_factory=list)


class AvanzarEstadoLote(BaseModel):
    observacion: Annotated[Optional[str], Field(max_length=200)] = None
    equipo_id: Optional[int] = None
    sector_id: Optional[int] = None


class ActualizarAlmacenamiento(BaseModel):
    equipo_id: Optional[int] = None
    sector_id: Optional[int] = None

class HistorialEstadoLoteResponse(BaseModel):
    id: int
    lote_id: int
    usuario_id: int
    estado: Annotated[str, Field(max_length=50)]
    fecha_hora: datetime
    usuario: Persona
    observacion: Annotated[Optional[str], Field(max_length=200)] = None

    model_config = ConfigDict(from_attributes=True)


class TrazabilidadOrigenInsumo(BaseModel):
    insumo_lote_id: int
    insumo_nombre: str
    marca: str
    numero_lote_insumo: str
    fecha_vencimiento: date
    cantidad_utilizada: Decimal
    unidad_medida: str
    lote_proveedor_id: Optional[int] = None
    numero_remito: Optional[str] = None
    fecha_recepcion: Optional[date] = None
    proveedor_id: Optional[int] = None
    proveedor_nombre: Optional[str] = None
    proveedor_cuit: Optional[str] = None


class TrazabilidadDestinoEnvio(BaseModel):
    envio_id: int
    numero_remito: str
    fecha_envio: date
    fecha_entrega: Optional[date] = None
    estado: str
    cantidad: int
    transportista: str
    cliente_id: int
    cliente_razon_social: str
    cliente_cuit: str
    direccion: str


class TrazabilidadLoteProduccion(BaseModel):
    lote_id: int
    producto_nombre: str
    fecha_produccion: date
    fecha_vencimiento: date
    cantidad_producida: int
    cantidad_disponible: int
    estado: str
    origenes: list[TrazabilidadOrigenInsumo] = Field(default_factory=list)
    destinos: list[TrazabilidadDestinoEnvio] = Field(default_factory=list)