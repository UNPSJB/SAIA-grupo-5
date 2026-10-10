from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

from src.incidentes.constants import EstadoIncidente
from src.sector.schemas import Sector
from src.tipo_incidente.schemas import TipoIncidente


class PersonaBasica(BaseModel):
    nombre: str
    apellido: str

    model_config = ConfigDict(from_attributes=True)


class TipoIncidenteResumen(BaseModel):
    id: int
    nombre: str

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
    estado: Literal["Abierto", "Cerrado"]
    activo: bool
    operario_id: int | None = None
    operario: PersonaBasica | None = None
    tipo_id: int
    tipo: TipoIncidente
    sector_id: int | None = None
    sector: Sector | None = None

    model_config = ConfigDict(from_attributes=True)


class IncidenteSeguimiento(BaseModel):
    id: int
    nombre: str
    descripcion: str
    estado: EstadoIncidente
    fecha: datetime
    fecha_abierto: datetime
    fecha_cierre: datetime | None
    foto_url: str | None
    reportado_por: str
    activo: bool
    tipo_id: int
    tipo: TipoIncidenteResumen
    dias_abierto: int
    nivel_demora: Literal["normal", "demorado"]


class IncidentesAbiertosPorTipo(BaseModel):
    tipo_id: int
    tipo: str
    cantidad: int
