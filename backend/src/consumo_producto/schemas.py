from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated

from src.insumos.constants import UnidadMedida    

class TareaResumen(BaseModel):
    id: int
    nombre: str
    model_config = ConfigDict(from_attributes=True)

class InsumoResumen(BaseModel):
    id: int
    nombre: str
    unidad_medida: UnidadMedida     

    model_config = ConfigDict(from_attributes=True)

class ConsumoProductoBase(BaseModel):
    tarea_id: int
    insumo_quimico_id: int
    cantidad_aproximada: Annotated[float, Field(gt=0.0)]
    unidad_medida: UnidadMedida    

class ConsumoProductoCreate(ConsumoProductoBase):
    pass

class ConsumoProductoUpdate(ConsumoProductoBase):
    pass

class ConsumoProducto(ConsumoProductoBase):
    id: int
    estado: bool
    
    tarea: TareaResumen   
    insumo: InsumoResumen
    model_config = ConfigDict(from_attributes=True)

class ConsumoProductoDelete(ConsumoProductoBase):
    id: int

