from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field
from src.producto.schemas import Producto
from src.insumos.schemas import Insumo
from src.lote_produccion.models import EstadoLote
from src.personal.schemas import Persona


class LoteProduccionBase(BaseModel):
    producto_id: int
    fecha_produccion: date
    fecha_vencimiento: date
    cantidad_producida: Annotated[int, Field(gt=0)]


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
    insumo_id: int
    cantidad_utilizada: Decimal = Field(gt=0, max_digits=12, decimal_places=3)


class InsumosUtilizadosCreate(BaseModel):
    insumos: list[InsumoUtilizadoCreate] = Field(min_length=1)


class InsumosUtilizadosUpdate(BaseModel):
    insumos: list[InsumoUtilizadoCreate]


class InsumoUtilizado(BaseModel):
    id: int
    lote_produccion_id: int
    insumo_id: int
    cantidad_utilizada: Decimal
    insumo: Insumo

    model_config = ConfigDict(from_attributes=True)


class LoteProduccionDetalle(LoteProduccion):
    insumos_utilizados: list[InsumoUtilizado] = Field(default_factory=list)


class AvanzarEstadoLote(BaseModel):
    observacion: Annotated[Optional[str], Field(max_length=200)] = None

class HistorialEstadoLoteResponse(BaseModel):
    id: int
    lote_id: int
    usuario_id: int
    estado: Annotated[str, Field(max_length=50)]
    fecha_hora: datetime
    usuario: Persona
    observacion: Annotated[Optional[str], Field(max_length=200)] = None

    model_config = ConfigDict(from_attributes=True)