from datetime import datetime
from pydantic import BaseModel, ConfigDict
from src.version_documento.schemas import PersonaBasica 


class HistorialVigencia(BaseModel):
    id: int
    documento_id: int
    version_anterior_id: int | None = None
    version_nueva_id: int
    persona: PersonaBasica
    fecha_hora: datetime
    model_config = ConfigDict(from_attributes=True)