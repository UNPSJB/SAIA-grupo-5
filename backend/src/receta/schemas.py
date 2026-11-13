from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, model_validator
from src.etapa_receta.schemas import EtapaReceta, EtapaRecetaAnidadaCreate
from src.unidad_medida.schemas import UnidadMedida
from src.aditivo.schemas import AditivoResumen
from src.receta.constants import ErrorCode, TipoRenglon


class InsumoRecetaCreate(BaseModel):
    insumo_id: int
    cantidad: Annotated[float, Field(gt=0)]
    tipo: TipoRenglon = TipoRenglon.INGREDIENTE
    aditivo_id: int | None = None

    @model_validator(mode="after")
    def validar_aditivo(self):
        if self.tipo == TipoRenglon.ADITIVO and self.aditivo_id is None:
            raise ValueError(ErrorCode.ADITIVO_SIN_CLASE_FUNCIONAL)
        if self.tipo == TipoRenglon.INGREDIENTE and self.aditivo_id is not None:
            raise ValueError(ErrorCode.INGREDIENTE_CON_ADITIVO)
        return self


class InsumoReceta(BaseModel):
    id: int
    insumo_id: int
    cantidad: float
    tipo: TipoRenglon
    aditivo_id: int | None = None
    aditivo: AditivoResumen | None = None
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
    rendimiento: Annotated[float | None, Field(gt=0)] = None
    rendimiento_unidad_medida_id: int | None = None
    insumos: list[InsumoRecetaCreate] = []


class RecetaBase(BaseModel):
    rendimiento: Annotated[float, Field(gt=0)]
    rendimiento_unidad_medida_id: int
    porcion: Annotated[float | None, Field(gt=0)] = None
    porcion_unidad_medida_id: int | None = None
    etapas: Annotated[list[EtapaRecetaAnidadaCreate], Field(min_length=1)]
    insumos: Annotated[list[InsumoRecetaCreate], Field(min_length=1)]

    @model_validator(mode="after")
    def validar_receta(self):
        if (self.porcion is None) != (self.porcion_unidad_medida_id is None):
            raise ValueError(ErrorCode.PORCION_INCOMPLETA)
        if not any(item.tipo == TipoRenglon.INGREDIENTE for item in self.insumos):
            raise ValueError(ErrorCode.RECETA_SIN_INGREDIENTES)
        return self


class RecetaCreate(RecetaBase):
    producto_id: int


class RecetaUpdate(RecetaBase):
    pass


class RecetaVersion(BaseModel):
    id: int
    producto_id: int
    version: int
    vigente: bool
    fecha_creacion: datetime
    fecha_desde_vigencia: datetime | None = None
    fecha_hasta_vigencia: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class Receta(RecetaVersion):
    rendimiento: float | None = None
    rendimiento_unidad_medida_id: int | None = None
    rendimiento_unidad_medida: UnidadMedida | None = None
    porcion: float | None = None
    porcion_unidad_medida_id: int | None = None
    porcion_unidad_medida: UnidadMedida | None = None
    etapas: list[EtapaReceta]
    insumos: list[InsumoReceta] = []
    sellos: EvaluacionSellos
