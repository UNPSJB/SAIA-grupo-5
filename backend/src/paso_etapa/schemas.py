from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field


class PasoEtapaBase(BaseModel):
    descripcion: Annotated[str, Field(min_length=1, max_length=500)]


# Paso dentro de una etapa que se crea completa (el orden lo da la posición en la lista)
class PasoEtapaAnidadoCreate(PasoEtapaBase):
    pass


class PasoEtapaCreate(PasoEtapaBase):
    etapa_id: int
    # Si no se indica, el paso se agrega al final de la etapa
    orden: Annotated[int | None, Field(ge=1)] = None


class PasoEtapaUpdate(PasoEtapaBase):
    pass


class PasoEtapaOrden(BaseModel):
    orden: Annotated[int, Field(ge=1)]


class PasoEtapa(PasoEtapaBase):
    id: int
    etapa_id: int
    orden: int

    model_config = ConfigDict(from_attributes=True)
