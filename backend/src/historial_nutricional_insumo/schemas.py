from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import datetime
from src.personal.schemas import Persona

class HistorialNutricionalInsumo(BaseModel):
    id: int
    info_nutricional_id: int
    dato_modificado: Annotated[str, Field(max_length=50)]
    valor_anterior: Annotated[str | None, Field(max_length=50)] = None
    valor_nuevo: Annotated[str | None, Field(max_length=50)] = None
    motivo: Annotated[str | None, Field(max_length=500)] = None

    modificada_por_id: int
    modificada_por: Persona
    fecha_modificacion: datetime
    
    model_config = ConfigDict(from_attributes=True)
