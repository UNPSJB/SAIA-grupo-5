from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from src.aditivo.constants import ClaseFuncional, ErrorCode


class AditivoBase(BaseModel):
    clase_funcional: ClaseFuncional
    nombre: Annotated[str, Field(min_length=3, max_length=100)]
    numero_ins: Annotated[str | None, Field(max_length=20)] = None

    @field_validator("nombre", "numero_ins")
    @classmethod
    def quitar_espacios(cls, valor: str | None) -> str | None:
        if valor is None:
            return None
        valor = valor.strip()
        return valor or None

    @model_validator(mode="after")
    def validar_numero_ins(self):
        if self.numero_ins is None and self.clase_funcional != ClaseFuncional.AROMATIZANTE:
            raise ValueError(ErrorCode.NUMERO_INS_OBLIGATORIO)
        return self


class AditivoCreate(AditivoBase):
    pass


class AditivoUpdate(AditivoBase):
    pass


class Aditivo(AditivoBase):
    id: int
    activo: bool

    model_config = ConfigDict(from_attributes=True)


class AditivoResumen(BaseModel):
    id: int
    clase_funcional: str
    nombre: str
    numero_ins: str | None = None

    model_config = ConfigDict(from_attributes=True)
