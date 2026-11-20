from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from decimal import Decimal
from datetime import datetime
from src.personal.schemas import Persona

class FuenteNutricionalBase(BaseModel):
    nombre: Annotated[str, Field(min_length=3, max_length=60)]
    descripcion: Annotated[str  | None, Field(default=None, min_length=5, max_length=500)] = None
    origen: Annotated[str  | None, Field(default=None, min_length=5, max_length=500)] = None
    licencia_uso: Annotated[str, Field(min_length=5, max_length=500)]
    formato_uso: Annotated[str, Field(min_length=5, max_length=500)]
    licencia_verificada: bool

class FuenteNutricionalCreate(FuenteNutricionalBase):
    pass

class FuenteNutricionalUpdate(FuenteNutricionalBase):
    pass
    
class FuenteNutricional(FuenteNutricionalBase):
    id: int
    activo: bool
    verificada_por_id: int | None = None
    fecha_verificacion: datetime | None = None
    verificada_por: Persona | None = None

    model_config = ConfigDict(from_attributes=True)

class AlimentoReferencia(BaseModel):
    id: int
    fuente_nutricional_id: int 
    codigo_externo: str | None = None
    nombre: str
    valor_energetico: Decimal | None = None
    carbohidratos: Decimal | None = None
    azucares_totales: Decimal | None = None
    azucares_anadidos: Decimal | None = None
    proteinas: Decimal | None = None
    grasas_totales: Decimal | None = None
    grasas_saturadas: Decimal | None = None
    grasas_trans: Decimal | None = None
    fibra_alimentaria: Decimal | None = None
    sodio: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)
