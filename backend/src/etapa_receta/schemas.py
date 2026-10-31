from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field
from src.paso_etapa.schemas import PasoEtapa, PasoEtapaAnidadoCreate


class EtapaRecetaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=80)]


# Etapa dentro de una receta que se crea completa (el orden lo da la posición en la lista)
class EtapaRecetaAnidadaCreate(EtapaRecetaBase):
    pasos: Annotated[list[PasoEtapaAnidadoCreate], Field(min_length=1)]


class EtapaRecetaCreate(EtapaRecetaBase):
    receta_id: int
    # Si no se indica, la etapa se agrega al final de la receta
    orden: Annotated[int | None, Field(ge=1)] = None
    pasos: Annotated[list[PasoEtapaAnidadoCreate], Field(min_length=1)]


class EtapaRecetaUpdate(EtapaRecetaBase):
    pass


class EtapaRecetaOrden(BaseModel):
    orden: Annotated[int, Field(ge=1)]


class EtapaReceta(EtapaRecetaBase):
    id: int
    receta_id: int
    orden: int
    pasos: list[PasoEtapa]

    model_config = ConfigDict(from_attributes=True)
