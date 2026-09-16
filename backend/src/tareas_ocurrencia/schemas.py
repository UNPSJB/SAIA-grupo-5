from pydantic import BaseModel, ConfigDict
from datetime import date
from src.tareas_ocurrencia.constants import EstadoTareaOcurrencia

class TareaOcurrencia(BaseModel):
    id: int
    operario_id: int | None
    tarea_nombre_snap: str
    tarea_descripcion_snap: str | None
    frecuencia_snap: str
    plan_nombre_snap: str
    fecha: date
    fecha_completado: date | None
    estado: EstadoTareaOcurrencia

    model_config = ConfigDict(from_attributes=True)

class TareaOcurrenciaCompletar(BaseModel):
    operario_id: int
