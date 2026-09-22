from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import date
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia

class TareaOcurrenciaCreate(BaseModel):
    operario_id: int | None = None
    tarea_nombre_snap: Annotated[str, Field(min_length=1, max_length=80)]
    tarea_descripcion_snap: Annotated[str | None, Field(max_length=500)] = None
    frecuencia_snap: Annotated[str, Field(min_length=1, max_length=20)]
    prioridad_snap: Annotated[str, Field(min_length=1, max_length=10)]
    foto_obligatoria_snap: bool = False
    accion_correctiva_snap: Annotated[str | None, Field(max_length=500)] = None
    plan_nombre_snap: Annotated[str, Field(min_length=1, max_length=60)]
    fecha: date
    fecha_completado: date | None = None
    estado: EstadoTareaOcurrencia = EstadoTareaOcurrencia.PENDIENTE

class TareaOcurrencia(BaseModel):
    id: int
    operario_id: int | None
    tarea_nombre_snap: str
    tarea_descripcion_snap: str | None
    frecuencia_snap: str
    prioridad_snap: str
    foto_obligatoria_snap: bool
    accion_correctiva_snap: str | None
    plan_nombre_snap: str
    fecha: date
    fecha_completado: date | None
    estado: EstadoTareaOcurrencia

    model_config = ConfigDict(from_attributes=True)

class TareaOcurrenciaCompletar(BaseModel):
    operario_id: int
