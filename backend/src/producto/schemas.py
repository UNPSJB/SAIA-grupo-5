from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import date, datetime
from src.unidad_medida.schemas import UnidadMedida

class Receta(BaseModel):
    id: int

    model_config = ConfigDict(from_attributes=True)


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
    envasado_ausencia_cliente: bool | None = None
    azucares_agregados: bool | None = None
    grasas_agregadas: bool | None = None
    sodio_agregado: bool | None = None
    contiene_edulcorantes: bool | None = None
    contiene_cafeina: bool | None = None
    unidad_medida: UnidadMedida
    receta: Receta | None = None

    model_config = ConfigDict(from_attributes=True)
