from datetime import date, datetime
from typing import Annotated, Optional
from pydantic import BaseModel, ConfigDict, Field
from src.supervision_lote.constants import EstadoSupervisionOcurrencia


class PersonaBasica(BaseModel):
    id: int
    nombre: str
    apellido: str

    model_config = ConfigDict(from_attributes=True)


class SupervisionOcurrenciaBase(BaseModel):
    lote_produccion_id: int
    fase_lote_snap: Annotated[str, Field(min_length=1, max_length=40)]
    receta_id_origen: Optional[int] = None
    receta_version_snap: Optional[int] = None
    etapa_id_origen: Optional[int] = None
    etapa_nombre_snap: Annotated[str, Field(min_length=1, max_length=80)]
    etapa_orden_snap: int = 1
    paso_id_origen: Optional[int] = None
    paso_descripcion_snap: Annotated[str, Field(min_length=1, max_length=500)]
    paso_orden_snap: int = 1
    producto_nombre_snap: Annotated[str, Field(min_length=1, max_length=80)]
    cantidad_lote_snap: Annotated[str, Field(min_length=1, max_length=80)]
    fecha: date


class SupervisionOcurrenciaCreate(SupervisionOcurrenciaBase):
    supervisor_id: Optional[int] = None
    estado: EstadoSupervisionOcurrencia = EstadoSupervisionOcurrencia.PENDIENTE


class SupervisionOcurrencia(SupervisionOcurrenciaBase):
    id: int
    supervisor_id: Optional[int] = None
    supervisor: Optional[PersonaBasica] = None
    fecha_completado: Optional[datetime] = None
    fue_editada: bool
    fecha_edicion: Optional[datetime] = None
    observacion: Optional[str] = None
    estado: EstadoSupervisionOcurrencia

    model_config = ConfigDict(from_attributes=True)


class SupervisionOcurrenciaCompletar(BaseModel):
    observacion: Annotated[Optional[str], Field(max_length=500)] = None
