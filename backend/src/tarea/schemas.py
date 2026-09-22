from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from src.tarea.constants import Frecuencia, Prioridad

class TareaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=80)]
    descripcion: Annotated[str | None, Field(max_length=500)] = None
    frecuencia: Frecuencia
    prioridad: Prioridad
    foto_obligatoria: bool = False
    accion_correctiva: Annotated[str | None, Field(max_length=500)] = None
    plan_limpieza_id: int

class TareaCreate(TareaBase):
    pass

class TareaUpdate(TareaBase):
    pass

class Tarea(TareaBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)

class TareaDelete(TareaBase):
    id: int
