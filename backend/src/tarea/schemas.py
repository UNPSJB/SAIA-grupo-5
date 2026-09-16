from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from src.tarea.constants import Frecuencia

class TareaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=80)]
    descripcion: Annotated[str | None, Field(max_length=255)] = None
    frecuencia: Frecuencia
    plan_limpieza_id: int

class TareaCreate(TareaBase):
    pass

class TareaUpdate(TareaBase):
    pass

class Tarea(TareaBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class TareaDelete(TareaBase):
    id: int
