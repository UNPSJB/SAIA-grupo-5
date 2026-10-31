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
    vista_publica_activa: bool = False
    vista_publica_token: str | None = None
    vista_publica_nombre_establecimiento: Annotated[str, Field(min_length=1, max_length=100)] = "Mi establecimiento"
    vista_publica_mostrar_cumplimiento: bool = False
    vista_publica_mostrar_calibraciones: bool = False
    vista_publica_mostrar_tiempo_calibracion: bool = False
    vista_publica_mostrar_recambios: bool = False
    vista_publica_mostrar_tiempo_recambio: bool = False
    vista_publica_mostrar_planes_limpieza: bool = False


class ConfiguracionSistemaUpdate(BaseModel):
    dias_antelacion_vencimiento: Annotated[int | None, Field(ge=0)] = None
    dias_antelacion_elementos: Annotated[int | None, Field(ge=0)] = None
    hora_generacion_checklists: Annotated[int | None, Field(ge=0, le=23)] = None
    minuto_generacion_checklists: Annotated[int | None, Field(ge=0, le=59)] = None
    vista_publica_activa: bool | None = None
    vista_publica_nombre_establecimiento: Annotated[str | None, Field(min_length=1, max_length=100)] = None
    vista_publica_mostrar_cumplimiento: bool | None = None
    vista_publica_mostrar_calibraciones: bool | None = None
    vista_publica_mostrar_tiempo_calibracion: bool | None = None
    vista_publica_mostrar_recambios: bool | None = None
    vista_publica_mostrar_tiempo_recambio: bool | None = None
    vista_publica_mostrar_planes_limpieza: bool | None = None


class IndicadorVistaPublica(BaseModel):
    clave: str
    titulo: str
    descripcion: str
    valor: str
    icono: str


class VistaPublica(BaseModel):
    establecimiento: str
    actualizado: str
    indicadores: list[IndicadorVistaPublica]


class ConfiguracionSistema(ConfiguracionSistemaBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
