from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, field_validator

from src.configuracion_sistema.constants import (
    DIAS_ANTELACION_VENCIMIENTO_DEFAULT,
    HORA_GENERACION_CHECKLISTS_DEFAULT,
    MINUTO_GENERACION_CHECKLISTS_DEFAULT,
)


class DatosPymeBase(BaseModel):
    nombre_pyme: Annotated[str, Field(min_length=1, max_length=100)] = "Mi establecimiento"
    logo_pyme: str | None = None
    telefono_pyme: Annotated[str | None, Field(max_length=30)] = None
    email_pyme: Annotated[str | None, Field(max_length=150)] = None
    direccion_pyme: Annotated[str | None, Field(max_length=200)] = None

    @field_validator("nombre_pyme")
    @classmethod
    def validar_nombre(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError("El nombre de la PyME es obligatorio.")
        return valor

    @field_validator("logo_pyme")
    @classmethod
    def validar_logo(cls, valor: str | None) -> str | None:
        if valor is None:
            return None

        if not valor.startswith(("data:image/png;base64,", "data:image/jpeg;base64,", "data:image/webp;base64,")):
            raise ValueError("El logo debe ser una imagen PNG, JPG o WebP en Base64.")

        # Máximo aproximado de 2 MB de archivo original
        if len(valor) > 2_800_000:
            raise ValueError("El logo no puede superar los 2 MB.")

        return valor


class ConfiguracionSistemaBase(DatosPymeBase):
    dias_antelacion_vencimiento: Annotated[int, Field(ge=0, default=DIAS_ANTELACION_VENCIMIENTO_DEFAULT)]
    dias_antelacion_elementos: Annotated[int, Field(ge=0, default=DIAS_ANTELACION_VENCIMIENTO_DEFAULT)]
    hora_generacion_checklists: Annotated[int, Field(ge=0, le=23, default=HORA_GENERACION_CHECKLISTS_DEFAULT)]
    minuto_generacion_checklists: Annotated[int, Field(ge=0, le=59, default=MINUTO_GENERACION_CHECKLISTS_DEFAULT)]
    vista_publica_activa: bool = False
    vista_publica_token: str | None = None
    vista_publica_mostrar_cumplimiento: bool = False
    vista_publica_mostrar_calibraciones: bool = False
    vista_publica_mostrar_tiempo_calibracion: bool = False
    vista_publica_mostrar_recambios: bool = False
    vista_publica_mostrar_tiempo_recambio: bool = False
    vista_publica_mostrar_planes_limpieza: bool = False
    vista_publica_mostrar_tareas_realizadas: bool = False
    vista_publica_mostrar_dias_limpieza: bool = False
    vista_publica_mostrar_documentos_tecnicos: bool = False
    vista_publica_mostrar_productos_elaborados: bool = False
    vista_publica_mostrar_lotes_producidos: bool = False


class ConfiguracionSistemaUpdate(BaseModel):
    nombre_pyme: Annotated[str | None, Field(min_length=1, max_length=100)] = None
    logo_pyme: str | None = None
    telefono_pyme: Annotated[str | None, Field(max_length=30)] = None
    email_pyme: Annotated[str | None, Field(max_length=150)] = None
    direccion_pyme: Annotated[str | None, Field(max_length=200)] = None

    dias_antelacion_vencimiento: Annotated[int | None, Field(ge=0)] = None
    dias_antelacion_elementos: Annotated[int | None, Field(ge=0)] = None
    hora_generacion_checklists: Annotated[int | None, Field(ge=0, le=23)] = None
    minuto_generacion_checklists: Annotated[int | None, Field(ge=0, le=59)] = None
    vista_publica_activa: bool | None = None
    vista_publica_mostrar_cumplimiento: bool | None = None
    vista_publica_mostrar_calibraciones: bool | None = None
    vista_publica_mostrar_tiempo_calibracion: bool | None = None
    vista_publica_mostrar_recambios: bool | None = None
    vista_publica_mostrar_tiempo_recambio: bool | None = None
    vista_publica_mostrar_planes_limpieza: bool | None = None
    vista_publica_mostrar_tareas_realizadas: bool | None = None
    vista_publica_mostrar_dias_limpieza: bool | None = None
    vista_publica_mostrar_documentos_tecnicos: bool | None = None
    vista_publica_mostrar_productos_elaborados: bool | None = None
    vista_publica_mostrar_lotes_producidos: bool | None = None

    @field_validator("nombre_pyme")
    @classmethod
    def validar_nombre(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        valor = valor.strip()
        if not valor:
            raise ValueError("El nombre de la PyME es obligatorio.")
        return valor

    @field_validator("logo_pyme")
    @classmethod
    def validar_logo(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        if not valor.startswith(("data:image/png;base64,", "data:image/jpeg;base64,", "data:image/webp;base64,")):
            raise ValueError("El logo debe ser una imagen PNG, JPG o WebP en Base64.")
        if len(valor) > 2_800_000:
            raise ValueError("El logo no puede superar los 2 MB.")
        return valor


class IndicadorVistaPublica(BaseModel):
    clave: str
    titulo: str
    descripcion: str
    valor: str
    icono: str


class VistaPublica(BaseModel):
    establecimiento: str
    logo_pyme: str | None = None
    telefono_pyme: str | None = None
    email_pyme: str | None = None
    direccion_pyme: str | None = None
    actualizado: str
    indicadores: list[IndicadorVistaPublica]


class ConfiguracionSistema(ConfiguracionSistemaBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
