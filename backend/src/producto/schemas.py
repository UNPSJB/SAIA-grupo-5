from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import date, datetime
from src.unidad_medida.schemas import UnidadMedida

class ProductoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=3, max_length=40)]
    descripcion: Annotated[str | None, Field(default=None, min_length=5, max_length=500)] = None
    cantidad_neta: Annotated[int, Field(gt=0)]
    unidad_medida_id: int
    fecha_lanzamiento: date
    foto_producto: str | None = None

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(ProductoBase):
    pass

class Producto(ProductoBase):
    id: int
    activo: bool
    unidad_medida: UnidadMedida

    model_config = ConfigDict(from_attributes=True)
