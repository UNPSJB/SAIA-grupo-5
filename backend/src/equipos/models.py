from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.models import ModeloBase

if TYPE_CHECKING:
    from src.sector.models import Sector
    from src.tarea.models import Tarea


class Equipo(ModeloBase):
    __tablename__ = "equipos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nombre: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    categoria: Mapped[str] = mapped_column(String(100))
    ubicacion: Mapped[str] = mapped_column(String(100))
    estado: Mapped[bool] = mapped_column(default=True)
    sector_id: Mapped[int] = mapped_column(ForeignKey("sectores.id"), nullable=False)
    sector: Mapped["Sector"] = relationship(back_populates="equipos")
    tareas: Mapped[list["Tarea"]] = relationship(back_populates="equipo")

    controla_temperatura: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    temperatura_minima: Mapped[float | None] = mapped_column(Float, nullable=True)
    temperatura_maxima: Mapped[float | None] = mapped_column(Float, nullable=True)
    
    #Relacion con plan calibracion
    plan_calibracion: Mapped["PlanCalibracion | None"] = relationship(back_populates="equipo", uselist=False)