from pydantic import BaseModel, Field, ConfigDict
from typing import Annotated
from src.unidad_medida.constants import MasaVolumen

class UnidadMedidaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=3, max_length=40)]

class UnidadMedidaCreate(UnidadMedidaBase):
    pass

class UnidadMedidaUpdate(UnidadMedidaBase):
    pass

class UnidadMedida(UnidadMedidaBase):
    id: int
    activo: bool
    
    # unidad de medida estándar (mg, g, kg, ml, l)
    codigo: str | None = None
    masa_volumen: MasaVolumen | None = None
    factor_a_base: float | None = None

    model_config = ConfigDict(from_attributes=True)