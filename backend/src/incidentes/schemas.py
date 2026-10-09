from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import datetime
from src.incidentes.constants import EstadoIncidente
from typing import TYPE_CHECKING
from src.tipo_incidente.schemas import TipoIncidente
from src.sector.schemas import Sector

class PersonaBasica(BaseModel):
    nombre: str
    apellido: str
    
    model_config = ConfigDict(from_attributes=True)

class IncidenteBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=60)]
    descripcion: Annotated[str, Field(min_length=1, max_length=500)]
    foto_opcional: str | None = None

class IncidenteCreate(IncidenteBase):
    tipo_id: int
    sector_id: int | None = None

class IncidenteUpdate(IncidenteBase):
    pass

class Incidente(IncidenteBase):
    id: int
    fecha_abierto: datetime
    fecha_cierre: datetime | None = None
    estado: EstadoIncidente
    activo: bool
    operario_id: int 
    operario: PersonaBasica
    tipo_id: int 
    tipo: TipoIncidente
    sector_id: int | None = None
    sector: Sector | None = None
    
    model_config = ConfigDict(from_attributes=True)
