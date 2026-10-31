from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field
from src.etapa_receta.schemas import EtapaReceta, EtapaRecetaAnidadaCreate


class RecetaCreate(BaseModel):
    producto_id: int
    etapas: Annotated[list[EtapaRecetaAnidadaCreate], Field(min_length=1)]


class RecetaUpdate(BaseModel):
    etapas: Annotated[list[EtapaRecetaAnidadaCreate], Field(min_length=1)]


class Receta(BaseModel):
    id: int
    producto_id: int
    fecha_creacion: datetime
    etapas: list[EtapaReceta]

    model_config = ConfigDict(from_attributes=True)
