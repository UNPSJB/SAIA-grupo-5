from datetime import date
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field
from src.producto.schemas import Producto
from src.lote_produccion.models import EstadoLote


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

    model_config = ConfigDict(from_attributes=True)

class LoteProduccionHistorial(BaseModel):
    lotes: list[LoteProduccion]
    total_producido: int | None = None
    
class EstadisticaProduccion(BaseModel):
    producto_id: int
    producto_nombre: str
    fecha: date
    cantidad: int
