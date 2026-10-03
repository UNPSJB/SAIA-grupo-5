from datetime import date, datetime
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field
from src.tipos_vencimientos.schemas import TipoVencimiento


class PersonaBasica(BaseModel):
    id: int
    nombre: str
    apellido: str

    model_config = ConfigDict(from_attributes=True)


class VencimientoPersonalBase(BaseModel):
    fecha_desde: date
    fecha_hasta: date
    observacion: Annotated[str | None, Field(default=None, min_length=5, max_length=500)] = None
    archivo_adjunto: str | None = None


class VencimientoPersonalCreate(VencimientoPersonalBase):
    persona_id: int
    tipo_vencimiento_id: int


class VencimientoPersonalUpdate(VencimientoPersonalBase):
    pass


class VencimientoPersonal(VencimientoPersonalBase):
    id: int
    persona_id: int
    tipo_vencimiento_id: int
    fecha_carga: datetime
    es_actual: bool
    dias_restantes: int    
    
    persona: PersonaBasica | None = None
    tipo_vencimiento: TipoVencimiento | None = None

    model_config = ConfigDict(from_attributes=True)