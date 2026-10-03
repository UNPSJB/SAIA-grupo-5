from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from src.notificaciones.constants import TipoNotificacion


class NotificacionCreate(BaseModel):
    tipo: TipoNotificacion
    entidad: str = Field(min_length=1, max_length=200)
    titulo: str = Field(min_length=1, max_length=200)
    descripcion: str = Field(min_length=1)
    entidad_id: int | None = None
    url: str | None = Field(default=None, max_length=300)


class Notificacion(BaseModel):
    id: int
    administrador_id: int
    clave_origen: str
    tipo: str
    entidad_id: int | None
    entidad: str
    titulo: str
    descripcion: str
    url: str | None
    leida: bool
    resuelta: bool
    creada_en: datetime
    resuelta_en: datetime | None

    model_config = ConfigDict(from_attributes=True)
