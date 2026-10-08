from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field

from src.configuracion_sistema.constants import (
    DIAS_ANTELACION_VENCIMIENTO_DEFAULT,
    HORA_GENERACION_CHECKLISTS_DEFAULT,
    MINUTO_GENERACION_CHECKLISTS_DEFAULT,
)


class ConfiguracionSistemaBase(BaseModel):
    dias_antelacion_vencimiento: Annotated[int, Field(ge=0, default=DIAS_ANTELACION_VENCIMIENTO_DEFAULT)]
    dias_antelacion_elementos: Annotated[int, Field(ge=0, default=DIAS_ANTELACION_VENCIMIENTO_DEFAULT)]
    hora_generacion_checklists: Annotated[int, Field(ge=0, le=23, default=HORA_GENERACION_CHECKLISTS_DEFAULT)]
    minuto_generacion_checklists: Annotated[int, Field(ge=0, le=59, default=MINUTO_GENERACION_CHECKLISTS_DEFAULT)]


class ConfiguracionSistemaUpdate(ConfiguracionSistemaBase):
    pass


class ConfiguracionSistema(ConfiguracionSistemaBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
