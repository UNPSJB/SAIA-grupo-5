from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import date

from src.insumos.constants import UnidadMedida      #TODO: Borrar dsps


class ConsumoProductoBase(BaseModel):
    tarea_id: int
    insumo_quimico_id: int
    cantidad_aproximada: Annotated[float, Field(gt=0.0)]
    unidad_medida: UnidadMedida     #TODO: Borrar dsps
    #unidad_medida: str

class ConsumoProductoCreate(ConsumoProductoBase):
    pass

class ConsumoProductoUpdate(ConsumoProductoBase):
    pass

class ConsumoProducto(ConsumoProductoBase):
    id: int
    estado: bool
    #tarea: str      #TODO: Borrar dsps
    #tarea: TareaResumen        #TODO: Agregar con implementacion
    insumo: InsumoResumen
    model_config = ConfigDict(from_attributes=True)

class ConsumoProductoDelete(ConsumoProductoBase):
    id: int

class TareaResumen(BaseModel):
    nombre: str
    fecha: date

class InsumoResumen(BaseModel):
    nombre: str
    unidad_medida: UnidadMedida     #TODO: Borrar dsps
    #unidad_medida: UnidadMedidaResumen        #TODO: Agregar si unidad de medida tiene tipo

class UnidadMedidaResumen(BaseModel):
    nombre: str
    tipo: str
    factor: float
