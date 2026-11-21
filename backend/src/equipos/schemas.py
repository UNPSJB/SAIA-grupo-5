from datetime import date
from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import Annotated
from src.equipos import exceptions
from src.sector.schemas import Sector as SectorSchema


class EquipoBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=100)]
    categoria: Annotated[str, Field(default=None, max_length=100)]
    ubicacion: Annotated[str, Field(default=None, max_length=100)]
    sector_id: int
    controla_temperatura: bool = False
    temperatura_minima: float | None = None
    temperatura_maxima: float | None = None

    @model_validator(mode="after")
    def validar_rango_temperatura(self):
        if self.controla_temperatura:
            if self.temperatura_minima is None or self.temperatura_maxima is None:
                raise exceptions.RangoTemperaturaIncompleto()
            if self.temperatura_minima >= self.temperatura_maxima:
                raise exceptions.RangoTemperaturaInvalido()
        else:
            self.temperatura_minima = None
            self.temperatura_maxima = None
        return self


class EquipoCreate(EquipoBase):
    pass


class EquipoUpdate(BaseModel):
    # INLUIR UN exclude_unset=True EN LOS model.dump en services
    nombre: str | None = None
    categoria: str | None = None
    ubicacion: str | None = None
    sector_id: int | None = None
    controla_temperatura: bool | None = None
    temperatura_minima: float | None = None
    temperatura_maxima: float | None = None


class Equipo(EquipoBase):
    id: int
    estado: bool
    sector: SectorSchema

    model_config = ConfigDict(from_attributes=True)


class InsumoAlmacenadoResumen(BaseModel):
    id: int
    insumo_nombre: str
    marca: str
    numero_lote: str
    cantidad_restante: int
    unidad_medida: str
    fecha_vencimiento: date


class LoteAlmacenadoResumen(BaseModel):
    id: int
    producto_nombre: str
    cantidad_disponible: int
    estado: str
    fecha_produccion: date
    fecha_vencimiento: date


class AlmacenamientoEquipoResponse(BaseModel):
    insumos: list[InsumoAlmacenadoResumen] = []
    lotes_produccion: list[LoteAlmacenadoResumen] = []
