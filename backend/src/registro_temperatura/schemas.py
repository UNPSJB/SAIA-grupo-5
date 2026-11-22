from datetime import datetime
from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field
from src.equipos.schemas import AlmacenamientoEquipoResponse, Equipo
from src.personal.schemas import Persona


class RegistroTemperaturaBase(BaseModel):
    equipo_id: int
    temperatura_registrada: float
    accion_tomada: Annotated[Optional[str], Field(max_length=500)] = None


class RegistroTemperaturaCreate(RegistroTemperaturaBase):
    reubicar_mercaderia: bool = False
    destino_equipo_id: Optional[int] = None
    destino_sector_id: Optional[int] = None
    insumos_ids_a_mover: Optional[list[int]] = None
    lotes_ids_a_mover: Optional[list[int]] = None


class RegistroTemperatura(RegistroTemperaturaBase):
    id: int
    operario_id: int
    fecha_hora_registro: datetime
    fuera_de_rango: bool
    equipo: Equipo
    operario: Persona

    model_config = ConfigDict(from_attributes=True)


class RegistroTemperaturaResultado(RegistroTemperatura):
    almacenamiento_afectado: Optional[AlmacenamientoEquipoResponse] = None
