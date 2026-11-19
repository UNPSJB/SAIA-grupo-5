from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field
from src.receta.schemas import EvaluacionSellos
from src.rotulado.constants import EstadoRotulado


class ReglasRotuladoBase(BaseModel):
    requiere_envasado_ausencia_cliente: bool
    aplica_por_azucares: bool
    aplica_por_grasas: bool
    aplica_por_sodio: bool
    aplica_por_edulcorantes: bool
    aplica_por_cafeina: bool
    mensaje_no_corresponde: Annotated[str, Field(min_length=5, max_length=300)]
    mensaje_exceptuado: Annotated[str, Field(min_length=5, max_length=300)]


class ReglasRotuladoCreate(ReglasRotuladoBase):
    observacion: Annotated[str, Field(min_length=5, max_length=300)]


class ReglasRotulado(ReglasRotuladoCreate):
    id: int
    version: int
    vigente: bool
    fecha_desde_vigencia: datetime
    fecha_hasta_vigencia: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class RotuladoProductoUpdate(BaseModel):
    envasado_ausencia_cliente: bool | None = None
    azucares_agregados: bool | None = None
    grasas_agregadas: bool | None = None
    sodio_agregado: bool | None = None
    contiene_edulcorantes: bool | None = None
    contiene_cafeina: bool | None = None


class MarcaEvaluada(BaseModel):
    clave: str
    nombre: str
    sugerido: bool
    declarado: bool | None = None
    valor: bool
    considerada: bool
    insumos: list[str] = []


class EvaluacionRotulado(BaseModel):
    estado: EstadoRotulado
    mensaje: str
    envasado_ausencia_cliente: bool | None = None
    requiere_envasado_ausencia_cliente: bool
    marcas: list[MarcaEvaluada]
    reglas_version: int
    sellos: EvaluacionSellos | None = None
