from pydantic import BaseModel, ConfigDict
from datetime import datetime


class HistorialIncidente(BaseModel):
    id: int
    incidente_id: int
    tipo_evento: str
    fecha_evento: datetime
    usuario_id: int
    descripcion: str | None = None
    accion_correctiva_id: int | None = None

    model_config = ConfigDict(from_attributes=True)
