from pydantic import BaseModel, ConfigDict, Field
from typing import Annotated
from datetime import datetime
from decimal import Decimal
from src.personal.schemas import Persona


class ConfiguracionCalculoBase(BaseModel):
    factor_conversion_kj: Annotated[Decimal, Field(gt=0)]
    texto_no_significativo: Annotated[str, Field(min_length=1, max_length=100)]
    decimales_menor_a_1: Annotated[int, Field(ge=0, le=4)]
    decimales_entre_1_y_10: Annotated[int, Field(ge=0, le=4)]
    decimales_mayor_igual_10: Annotated[int, Field(ge=0, le=4)]

class ConfiguracionCalculoCreate(ConfiguracionCalculoBase):
    pass

class ConfiguracionCalculoUpdate(ConfiguracionCalculoBase):
    pass

class ConfiguracionCalculo(ConfiguracionCalculoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ParametroNutrienteBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=100)]
    unidad: Annotated[str, Field(min_length=1, max_length=10)]
    valor_diario_referencia: Annotated[Decimal | None, Field(default=None, gt=0)] = None
    declara_porcentaje_vd: bool
    umbral_no_significativo: Annotated[Decimal, Field(ge=0)]
    orden_tabla: Annotated[int, Field(ge=1)]

class ParametroNutrienteCreate(ParametroNutrienteBase):
    pass

class ParametroNutrienteUpdate(ParametroNutrienteBase):
    pass

class ParametroNutriente(ParametroNutrienteBase):
    id: int
    codigo_nutriente: str

    model_config = ConfigDict(from_attributes=True)

class CalculoRecetaCreate(BaseModel):
    rendimiento: Annotated[Decimal, Field(gt=0, le=10_000_000)]

class FilaNutrienteCalculado(BaseModel):
    codigo: str
    nombre: str
    unidad: str
    valor_100g_exacto: float
    valor_100g_redondeado: float
    texto_100g: str
    valor_porcion_exacto: float
    valor_porcion_redondeado: float
    texto_porcion: str
    porcentaje_vd: int | None = None
    kj_100g: int | None = None
    kj_porcion: int | None = None

class InformacionNutricionalReceta(BaseModel):
    id: int
    receta_id: int
    rendimiento: Decimal
    porcion: Decimal
    tabla_nutricional: list[FilaNutrienteCalculado]
    fecha_calculo: datetime

    model_config = ConfigDict(from_attributes=True)

class TablaNutricionalRotulo(BaseModel):
    receta_id: int
    receta_version: int
    producto: str
    unidad: str
    porcion: Decimal
    medida_casera: str | None = None
    tabla_nutricional: list[FilaNutrienteCalculado]
    fecha_calculo: datetime
    leyenda: str