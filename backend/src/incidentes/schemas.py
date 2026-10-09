from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class TipoIncidenteResumen(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)


class Incidente(BaseModel):
    id: int
    nombre: str
    descripcion: str
    estado: Literal["abierto", "cerrado"]
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
