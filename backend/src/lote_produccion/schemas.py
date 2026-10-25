from datetime import date
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field
from src.producto.schemas import Producto


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
    activo: bool
    producto: Producto

    model_config = ConfigDict(from_attributes=True)