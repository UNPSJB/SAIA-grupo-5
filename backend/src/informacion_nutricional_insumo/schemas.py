from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import datetime
from decimal import Decimal
from src.fuente_nutricional.schemas import FuenteNutricional
from src.personal.schemas import Persona

class InfoNutricionalBase(BaseModel):
    fuente_nutricional_id: int
    referencia_fuente: Annotated[str | None, Field(default=None, max_length=200)] = None

    valor_energetico: Annotated[Decimal | None, Field(default=None, ge=0)] = None
    carbohidratos: Annotated[Decimal | None, Field(default=None, ge=0)] = None
    azucares_totales: Annotated[Decimal | None, Field(default=None, ge=0)] = None
    azucares_anadidos: Annotated[Decimal | None, Field(default=None, ge=0)] = None
    proteinas: Annotated[Decimal | None, Field(default=None, ge=0)] = None
    grasas_totales: Annotated[Decimal | None, Field(default=None, ge=0)] = None
    grasas_saturadas: Annotated[Decimal | None, Field(default=None, ge=0)] = None
    grasas_trans: Annotated[Decimal | None, Field(default=None, ge=0)] = None
    fibra_alimentaria: Annotated[Decimal | None, Field(default=None, ge=0)] = None
    sodio: Annotated[Decimal | None, Field(default=None, ge=0)] = None

class InfoNutricionalCreate(InfoNutricionalBase):
    insumo_id: int | None = None
    aditivo_id: int | None = None
    modificado_respecto_fuente: bool = False

class InfoNutricionalUpdate(InfoNutricionalBase):
    pass
    
class InfoNutricional(InfoNutricionalBase):
    id: int
    insumo_id: int | None = None
    aditivo_id: int | None = None
    cargada_por_id: int
    fecha_carga: datetime
    modificado: bool
    modificada_por_id: int | None = None
    fecha_modificacion: datetime | None = None

    fuente_nutricional: FuenteNutricional
    cargada_por: Persona
    modificada_por: Persona | None = None

    model_config = ConfigDict(from_attributes=True)

