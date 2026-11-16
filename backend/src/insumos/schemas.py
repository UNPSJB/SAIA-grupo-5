from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import Annotated
from src.unidad_medida.schemas import UnidadMedida
from src.insumos.constants import ErrorCode

class InsumoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=3, max_length=40)]      # Esto hace que como minimo el nombre debe tener 1 caracter para cumplir con el criterio de aceptacion
    unidad_medida_id: int

class InformacionNutricional(BaseModel):
    valor_energetico: Annotated[float | None, Field(ge=0, le=900)] = None
    azucares_anadidos: Annotated[float | None, Field(ge=0, le=100)] = None
    grasas_totales: Annotated[float | None, Field(ge=0, le=100)] = None
    grasas_saturadas: Annotated[float | None, Field(ge=0, le=100)] = None
    sodio: Annotated[float | None, Field(ge=0, le=100000)] = None
    peso_unidad: Annotated[float | None, Field(gt=0)] = None

class InformacionNutricionalValidada(InformacionNutricional):
    @model_validator(mode="after")
    def validar_informacion_nutricional(self):
        valores = [self.valor_energetico, self.azucares_anadidos, self.grasas_totales, self.grasas_saturadas, self.sodio]
        cargados = [valor is not None for valor in valores]
        if any(cargados) and not all(cargados):
            raise ValueError(ErrorCode.INFORMACION_NUTRICIONAL_INCOMPLETA)
        if all(cargados) and self.grasas_saturadas > self.grasas_totales:
            raise ValueError(ErrorCode.GRASAS_SATURADAS_SUPERAN_TOTALES)
        return self

class MarcasAporte(BaseModel):
    aporta_azucares: bool = False
    aporta_grasas: bool = False
    aporta_sodio: bool = False
    aporta_edulcorantes: bool = False
    aporta_cafeina: bool = False

class InsumoCreate(InsumoBase, MarcasAporte, InformacionNutricionalValidada):
    pass

class InsumoUpdate(InsumoBase, MarcasAporte, InformacionNutricionalValidada):
    pass

class Insumo(InsumoBase, InformacionNutricional, MarcasAporte):
    id: int
    activo: bool
    unidad_medida: UnidadMedida

    model_config = ConfigDict(from_attributes=True)

class InsumoDelete(InsumoBase):
    id: int

