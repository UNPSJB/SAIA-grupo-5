from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import Annotated
from src.tarea.constants import Frecuencia, Prioridad


class SectorMinimal(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)


class SuperficieMinimal(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)


class EquipoMinimal(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)


class TareaBase(BaseModel):
    nombre: Annotated[str, Field(min_length=1, max_length=80)]
    descripcion: Annotated[str | None, Field(max_length=500)] = None
    frecuencia: Frecuencia
    prioridad: Prioridad
    foto_obligatoria: bool = False
    accion_correctiva: Annotated[str | None, Field(max_length=500)] = None
    procedimiento: list[str] | None = None
    plan_limpieza_id: int

    # Exactamente una de las tres, nunca ninguna, nunca más de una.
    sector_id: int | None = None
    superficie_id: int | None = None
    equipo_id: int | None = None

    @model_validator(mode="after")
    def _validar_exclusividad(self):
        cantidad = sum(
            valor is not None for valor in (self.sector_id, self.superficie_id, self.equipo_id)
        )
        if cantidad != 1:
            raise ValueError(
                "La tarea debe tener exactamente uno de sector_id, superficie_id o equipo_id."
            )
        return self


class TareaCreate(TareaBase):
    pass


class TareaUpdate(TareaBase):
    pass


class Tarea(TareaBase):
    id: int
    activo: bool
    sector: SectorMinimal | None = None
    superficie: SuperficieMinimal | None = None
    equipo: EquipoMinimal | None = None

    model_config = ConfigDict(from_attributes=True)


class TareaDelete(TareaBase):
    id: int
