from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field
from src.etapa_receta.schemas import EtapaReceta, EtapaRecetaAnidadaCreate
from src.unidad_medida.schemas import UnidadMedida


class InsumoRecetaCreate(BaseModel):
    insumo_id: int
    cantidad: Annotated[float, Field(gt=0)]


class InsumoReceta(InsumoRecetaCreate):
    id: int
    nombre: str
    unidad_medida: UnidadMedida

    model_config = ConfigDict(from_attributes=True)


class EvaluacionSellos(BaseModel):
    evaluable: bool
    es_liquido: bool
    cantidad_base: float | None = None
    valor_energetico: float | None = None
    azucares_anadidos: float | None = None
    grasas_totales: float | None = None
    grasas_saturadas: float | None = None
    sodio: float | None = None
    sellos: list[str] = []
    insumos_sin_informacion: list[str] = []


class EvaluacionSellosCreate(BaseModel):
    producto_id: int
    insumos: list[InsumoRecetaCreate] = []


class RecetaCreate(BaseModel):
    producto_id: int
    etapas: Annotated[list[EtapaRecetaAnidadaCreate], Field(min_length=1)]
    insumos: list[InsumoRecetaCreate] = []


class RecetaUpdate(BaseModel):
    etapas: Annotated[list[EtapaRecetaAnidadaCreate], Field(min_length=1)]
    insumos: list[InsumoRecetaCreate] | None = None


class Receta(BaseModel):
    id: int
    producto_id: int
    fecha_creacion: datetime
    etapas: list[EtapaReceta]
    insumos: list[InsumoReceta] = []
    sellos: EvaluacionSellos

    model_config = ConfigDict(from_attributes=True)
